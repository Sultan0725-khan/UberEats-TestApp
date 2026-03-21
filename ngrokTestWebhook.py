from flask import Flask, request
import hmac
import hashlib

app = Flask(__name__)

SIGNING_KEY = b"sqZ1h8Xo4qo8WSTmEJO2h19gVF7eBpifK7xy2vN8"

# Disable strict slashes globally for this blueprint/app
app.url_map.strict_slashes = False

@app.route("/", defaults={"path": ""}, methods=["POST", "GET"])
@app.route("/<path:path>", methods=["POST", "GET"])
def webhook(path):
    if request.method == "GET":
        return f"Listening on /{path}", 200

    raw_body = request.data
    signature = request.headers.get("X-Uber-Signature") or request.headers.get("X-Uber-Signature-New")

    print("---- Incoming Webhook ----")
    print("Headers:", dict(request.headers))
    body_str = raw_body.decode()
    print("Raw Body:", body_str)

    if signature:
        # Support both X-Uber-Signature and X-Uber-Signature-New
        computed = hmac.new(SIGNING_KEY, raw_body, hashlib.sha256).hexdigest()

        print(f"Received Signature ({request.headers.get('X-Uber-Signature-New') and 'New' or 'Old'}): {signature}")
        print("Computed Signature:", computed)

        if signature == computed:
            print("✅ Signature VALID")
            try:
                import json
                event = json.loads(body_str)
                print(f"📦 Event Type: {event.get('event_type')}")
                print(f"🆔 Event ID: {event.get('event_id')}")
                print(f"🕒 Event Time: {event.get('event_time')}")
            except Exception as e:
                print(f"⚠️ Error parsing JSON: {e}")
        else:
            print("❌ Signature INVALID")
    else:
        print("⚠️ No signature header found")

    return "OK", 200

if __name__ == "__main__":
    # app.run(port=3000)
    app.run(host="0.0.0.0", port=5001)
