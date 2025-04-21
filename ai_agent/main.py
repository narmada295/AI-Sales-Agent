import os
import random
import requests
import traceback
import asyncio 
import datetime
from uuid import uuid4
from fastapi import FastAPI, Request, Form
from fastapi.responses import Response, JSONResponse
from twilio.twiml.voice_response import VoiceResponse
from twilio.rest import Client
from dotenv import load_dotenv
import google.generativeai as genai
from google.cloud import speech_v1p1beta1 as speech
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
gemini_sem = asyncio.Semaphore(5)  # Allow up to 5 parallel Gemini calls


# === Load env variables ===
load_dotenv()

# === App Setup ===
app = FastAPI()

# === Configure Gemini ===
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# === Twilio Config ===
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
twilio_client = Client(TWILIO_SID, TWILIO_TOKEN)

# === Google STT Client ===
speech_client = speech.SpeechClient()

# === Base URL (tunnel URL) ===
BASE_URL = "https://cambodia-profiles-proceeding-helicopter.trycloudflare.com"

# === MongoDB ===
client = MongoClient("mongodb://localhost:27017/")
client.admin.command('ping')
print("✅ Connected to MongoDB successfully!")

# === Call sessions ===
call_sessions = {}

def now():
    return datetime.datetime.now().strftime("%H:%M:%S.%f")

SALES_PROMPT_TEMPLATE = """
You are a friendly and persuasive AI voice agent.
Sell this product:
{product_details}

To this customer:
{customer_details}

Use casual, natural phrases. Be brief and focused. Avoid repetition and greetings.
"""

def get_next_call_id():
    db = client["IMS"]
    counters = db["counters"]
    result = counters.find_one_and_update(
        {"_id": "callid"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True
    )
    return result["seq"]



@app.post("/start_bulk_calls")
async def start_bulk_calls(num_calls: int = Form(...)):
    try:
        print("🚨 /start_bulk_calls HIT!")
        db = client["IMS"]
        customers_col = db["customer"]
        all_customers = list(customers_col.find({}))
        if len(all_customers) < num_calls:
            return JSONResponse(
                status_code=400,
                content={"error": f"Only {len(all_customers)} customers available for calling."}
            )

        selected_customers = random.sample(all_customers, num_calls)

        # 🔒 Limit concurrent tasks (e.g., only 10 calls run at a time)
        sem = asyncio.Semaphore(3)

        async def process_customer_call(customer):
            async with sem:
                try:
                    phone_number = customer["PHONENO"]
                    interested_ids = customer.get("InterestedProducts", [])
                    if isinstance(interested_ids, list) and interested_ids:
                        product_id = random.choice(interested_ids)
                    else:
                        print(f"⚠ Skipping {phone_number}: Invalid or empty InterestedProducts => {interested_ids}")
                        return None  # Skip this customer
                    cid = get_next_call_id()
                    call_sessions[cid] = {
                        "phone": phone_number,
                        "history": [],
                        "product_id": product_id
                    }

                    twilio_client.calls.create(
                        to=phone_number,
                        from_=TWILIO_NUMBER,
                        url=f"{BASE_URL}/voice?cid={cid}"
                    )
                    print(f"[{now()}] 📞 Initiated call to {phone_number} with CID: {cid}")
                    return {"cid": cid, "customer": customer}
                except Exception as e:
                    print(f"[{now()}] ❌ Error for {customer['PHONENO']}: {e}")
                    return None

        tasks = [process_customer_call(cust) for cust in selected_customers]
        results = await asyncio.gather(*tasks)
        results = [r for r in results if r]

        return {
            "status": "Calls initiated",
            "call_ids": [r["cid"] for r in results],
            "called_customers": [
                {"name": r["customer"]["CUSTOMER_NAME"], "phone": r["customer"]["PHONENO"]}
                for r in results
            ]
        }

    except Exception as e:
        print(f"[{now()}] ❌ Bulk Call Error:")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

def generate_prompt(phone_number, product_id):
    db = client["IMS"]
    products_col = db["products"]
    customers_col = db["customer"]

    customer = customers_col.find_one({"PHONENO": phone_number})
    if not customer:
        return f"❌ No customer data found for phone number: {phone_number}"

    if not product_id:
        return f"❌ No ProductId found for customer with phone number: {phone_number}"

    product = products_col.find_one({"ProductId": product_id})
    if not product:
        return f"❌ No product found with ProductId: {product_id}"

    product_details = f"{product['ProductName']} - ₹{product['ProductPrice']} ({product['ProductDiscount']}% off): {product['ProductDescription']}"
    customer_details = f"{customer['CUSTOMER_NAME']} ({customer['PHONENO']}, {customer['ACCEPTANCE_RATE']}%)"

    return SALES_PROMPT_TEMPLATE.format(
        product_details=product_details,
        customer_details=customer_details
    )

def should_end_call(transcription: str) -> bool:
    end_phrases = ["bye", "goodbye", "talk to you later", "busy", "not now", "leave me", "stop", "hang up", "cut the call", "not interested", "cut"]
    transcription_lower = transcription.lower()
    return any(phrase in transcription_lower for phrase in end_phrases)

@app.post("/call")
async def make_call(phone: str = Form(...)):
    try:
        db = client["IMS"]
        call_log_col = db["call_log"]
        last_call = call_log_col.find_one(sort=[("CallId", -1)])  # Sort in descending order to get the last entry
        if last_call:
            # If there's a last call, increment its CallId by 1
            cid = last_call["CallId"] + 1
        else:
            # If the table is empty, start with 1
            cid = 1
        
        
        customers_col = db["customer"]
        customer = customers_col.find_one({"PHONENO": phone})
        if customer:
            # Try to reuse product_id if session already exists
            existing_session = next((v for v in call_sessions.values() if v["phone"] == phone), None)
            product_id = existing_session["product_id"] if existing_session else None

            # If no session exists and product_id is still None, choose one
            if product_id is None and customer and "InterestedProducts" in customer and customer["InterestedProducts"]:
                product_id = random.choice(customer["InterestedProducts"])

        else:
            product_id = None
        # Call session is being initialized correctly
        call_sessions[cid] = {
            "phone": phone,
            "history": [],
            "product_id": product_id
        }

        # Log the CID for debugging
        print(f"✅ Call session created with CID: {cid}")
        
        call = twilio_client.calls.create(
            to=phone,
            from_=TWILIO_NUMBER,
            url=f"{BASE_URL}/voice?cid={cid}"
        )
        return {"status": "Call initiated", "cid": cid}  # Return the cid to confirm the call was initiated
    except Exception as e:
        print(f"❌ Call Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/voice")
async def voice(request: Request):
    cid = request.query_params.get("cid")
    print(f"🔍 Received CID in /voice: {cid}")  # Debugging the received CID
    response = VoiceResponse()
    response.say("Hi! I'm James, your AI assistant. Let's talk about something exciting.")
    response.redirect(f"{BASE_URL}/record?cid={cid}")
    return Response(content=str(response), media_type="application/xml")

@app.post("/record")
async def record(request: Request):
    cid = request.query_params.get("cid")
    print(f"🔍 Received CID in /record: {cid}")  # Debugging the received CID
    response = VoiceResponse()
    response.record(
        max_length=20,
        timeout=2,
        transcribe=False,
        play_beep=True,
        trim="do-not-trim",
        action=f"{BASE_URL}/process_recording?cid={cid}"
    )
    return Response(content=str(response), media_type="application/xml")

@app.post("/process_recording")
async def process_recording(request: Request):
    try:
        cid = request.query_params.get("cid")
        print(f"🔍 Received CID in /process_recording: {cid}")  # Debugging the received CID
        
        # Ensure that cid exists in the call_sessions
        if not cid or int(cid) not in call_sessions:
            raise Exception(f"❌ Invalid or missing call session ID: {cid}")
        
        session = call_sessions[int(cid)]
        phone_number = session["phone"]
        history = session["history"]
        product_id = session.get("product_id") 
        
        if not product_id:
            raise Exception("❌ No product_id found in session.")
        
        print(f"🔍 Product ID: {product_id}")

        form = await request.form()
        recording_url = form.get("RecordingUrl")
        print(f"🎤 Twilio Recording URL: {recording_url}")

        if not recording_url:
            raise ValueError("Missing RecordingUrl")

        print("⏳ Waiting 4 seconds for Twilio to finish upload...")
        await asyncio.sleep(4)

        audio_response = requests.get(f"{recording_url}.wav", auth=(TWILIO_SID, TWILIO_TOKEN))
        if audio_response.status_code != 200:
            raise Exception(f"Twilio recording fetch failed with status code {audio_response.status_code}")

        audio_content = audio_response.content
        if len(audio_content) < 1000:
            raise Exception("Downloaded audio is too small — likely empty.")

        audio = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            language_code="en-US",
            enable_automatic_punctuation=True,
            model="phone_call",
        )

        print("🧠 Transcribing with Google STT...")
        response = speech_client.recognize(config=config, audio=audio)

        transcription = ""
        for result in response.results:
            transcription += result.alternatives[0].transcript

        print(f"📝 Transcription: {transcription}")

        if not transcription.strip():
            reply_text = "I'm sorry, I couldn't hear what you said."
        elif should_end_call(transcription):
            history.append({"role": "user", "text": transcription})

            conversation_text = "\n".join(
                [f"{msg['role'].capitalize()}: {msg['text']}" for msg in history]
            )
            summary_prompt = f"""
Given this conversation, summarize the call and state clearly if the user accepted the product, rejected it, or was neutral.

Conversation:
{conversation_text}
"""
            summary = model.generate_content(summary_prompt).text.strip()
            print("📋 Call Summary:\n", summary)
            outcome = "neutral"  # Default outcome is neutral
            if "accepted" in summary.lower():
                outcome = "positive"
            elif "rejected"  in summary.lower():
                outcome = "negative"
                
            db = client["IMS"]
            call_log_col = db["call_log"]
            call_log_col.insert_one({
                "CallId": int(cid),  # Use integer CID
                "PHONENO": phone_number,
                "CallSummary": summary,
                "Outcome": outcome,
                "TimeStamp": datetime.datetime.now(datetime.timezone.utc)
            })
            
            # Handle updates based on the outcome (product, sales, customer data)
            if outcome == "positive":
                # Update product availability
                products_col = db["products"]
                product = products_col.find_one({"ProductId": int(product_id)})
                if product:
                    discount = product["ProductDiscount"]
                    original_price = product["ProductPrice"]
                    discounted_price = original_price - (original_price * discount / 100)
                    new_availability = product["ProductAvailability"] - 1
                    products_col.update_one(
                        {"ProductId": int(product_id)},
                        {"$set": {"ProductAvailability": new_availability}}  # Decrease availability by 1
                    )

                sales_col = db["sales"]
                sales_col.insert_one({
                    "ProductId": int(product_id),
                    "PHONENO": phone_number,
                    "SellingPrice": discounted_price,
                    "TimeStamp": datetime.datetime.now(datetime.timezone.utc)
                })
                
            
            
            customers_col = db["customer"]
            customer = customers_col.find_one({"PHONENO": phone_number})
            if customer:
                new_total_calls = customer["TOTAL_CALLS_MADE"] + 1
                if outcome == "positive":
                    new_acceptance_rate = (customer["ACCEPTANCE_RATE"] * customer["TOTAL_CALLS_MADE"] + 1) / new_total_calls
                if outcome == "negative":
                    new_acceptance_rate = (customer["ACCEPTANCE_RATE"] * customer["TOTAL_CALLS_MADE"]) / new_total_calls
                if outcome == "neutral":
                    new_acceptance_rate = (customer["ACCEPTANCE_RATE"] * customer["TOTAL_CALLS_MADE"]) / new_total_calls
                customers_col.update_one(
                    {"PHONENO": phone_number},
                    {"$set": {"ACCEPTANCE_RATE": new_acceptance_rate, "TOTAL_CALLS_MADE": new_total_calls}}
                )
            
            voice_response = VoiceResponse()
            voice_response.say("Thank you for your time. Goodbye!")
            voice_response.hangup()
            return Response(content=str(voice_response), media_type="application/xml")
        else:
            history.append({"role": "user", "text": transcription})

            prompt = generate_prompt(phone_number, product_id)
            conversation_prompt = prompt + "\n\nConversation so far:\n"
            for msg in history:
                conversation_prompt += f"{msg['role'].capitalize()}: {msg['text']}\n"
            
            if history[-1]["role"] == "assistant":
                conversation_prompt = conversation_prompt.rsplit(f"Assistant: {history[-1]['text']}\n", 1)[0]

            async with gemini_sem:
                response = model.generate_content(conversation_prompt)
                reply_text = response.text.strip()

            print(f"🤖 Gemini Reply: {reply_text}")
           

        voice_response = VoiceResponse()
        voice_response.say(reply_text)
        voice_response.redirect(f"{BASE_URL}/record?cid={cid}")
        history.append({"role": "assistant", "text": reply_text})
        return Response(content=str(voice_response), media_type="application/xml")

    except Exception as e:
        print("❌ FULL ERROR:")
        traceback.print_exc()
        voice_response = VoiceResponse()
        voice_response.say("An error occurred. Please try again later.")
        return Response(content=str(voice_response), media_type="application/xml")


@app.post("/summary")
async def generate_summary(cid: str = Form(...)):
    try:
        if cid not in call_sessions:
            return JSONResponse(status_code=400, content={"error": "Invalid call ID."})

        history = call_sessions[cid]["history"]
        conversation_text = "\n".join(
            [f"{msg['role'].capitalize()}: {msg['text']}" for msg in history]
        )
        summary_prompt = f"""
Given this conversation, summarize the call and state clearly if the user accepted the product, rejected it, or was neutral.

Conversation:
{conversation_text}
"""
        summary = model.generate_content(summary_prompt).text.strip()
        print("📋 Call Summary:\n", summary)
        return {"summary": summary}
    except Exception as e:
        print("❌ Summary Error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})