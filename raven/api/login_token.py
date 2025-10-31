import frappe
from frappe.auth import LoginManager
from frappe.utils.response import build_response

@frappe.whitelist(allow_guest=True, methods=["POST"])
def login_via_token():
    """Login using API key and secret, and create session cookie."""
    origin = frappe.get_request_header("Origin") or "*"
    frappe.local.response["Access-Control-Allow-Origin"] = origin
    frappe.local.response["Access-Control-Allow-Credentials"] = "true"
    frappe.local.response["Access-Control-Allow-Headers"] = (
        "Authorization, Content-Type, X-Frappe-Site-Name"
    )
    
    auth_header = frappe.get_request_header("Authorization")

    if not auth_header or not auth_header.startswith("token "):
        frappe.throw("Missing Authorization header")

    try:
        api_key, api_secret = auth_header.split(" ")[1].split(":")
    except Exception:
        frappe.throw("Invalid Authorization format. Expected 'token <api_key>:<api_secret>'")

    # Find user by API key
    user = frappe.db.get_value("User", {"api_key": api_key})
    if not user:
        frappe.throw("Invalid API Key")

    stored_secret = frappe.utils.password.get_decrypted_password("User", user, fieldname="api_secret")
    if not stored_secret or stored_secret != api_secret:
        frappe.throw("Invalid API Secret")

    # Create session
    login_manager = LoginManager()
    #frappe.local.login_manager.user = user
    #frappe.local.login_manager.post_login()
    login_manager.login_as(user)
    #frappe.set_user(user)

    frappe.local.cookie_manager.init_cookies()
    if not frappe.conf.get("cookie_secure", False):
        frappe.local.cookie_manager.cookies["sid"]["secure"] = False

    frappe.db.commit()
    response = build_response("json")

    frappe.local.response["message"] = {
        "message": "Logged In",
        "user": user,
        "full_name": frappe.db.get_value("User", user, "full_name"),
        "sid": frappe.session.sid,
    }

    # response.set_cookie(
    #     "sid",
    #     frappe.session.sid,
    #     httponly=True,
    #     secure=False,  # set True if you are on HTTPS
    #     samesite="Lax",
    # )
    response.set_cookie(
        "sid",
        frappe.session.sid,
        httponly=True,
        secure=False,      # Needed for None in Chrome/Edge, must be HTTPS!
        samesite="None",  # Allows cross-origin, with credentials: 'include'
        domain=None,  # Use same everywhere as frontend/backend
    )

    frappe.local.cookie_manager.init_cookies()

    frappe.local.response["home_page"] = "/raven"
    frappe.local.response["full_name"] = frappe.db.get_value("User", user, "full_name")


    return {
        "message": "Logged In",
        "user": user,
        "full_name": frappe.db.get_value("User", user, "full_name"),
        "sid": frappe.session.sid,
    }
