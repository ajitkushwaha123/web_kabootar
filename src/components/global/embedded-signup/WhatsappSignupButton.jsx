"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export default function WhatsAppSignupButton() {
  const { user } = useUser();
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    const loadSDK = () => {
      if (document.getElementById("facebook-jssdk")) return;

      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    };

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: "v22.0",
      });

      setSdkLoaded(true);
      console.log("✅ Facebook SDK initialized");
    };
    
    window.addEventListener("message", (event) => {
      if (!event.origin.includes("facebook.com")) return;

      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          console.log("📩 WA_EMBEDDED_SIGNUP message received:", data);

          const fbData = data?.data || {};

          (async () => {
            try {
              const res = await axios.post("/api/whatsapp/wa-embedded-signup", {
                businessId: fbData?.business_id,
                phoneNumberId: fbData?.phone_number_id,
                waba_id: fbData?.waba_id,
                clerkUserId: user?.id,
              });

              console.log("✅ Embedded signup saved:", res.data);
            } catch (error) {
              console.error("🚨 Error saving WA_EMBEDDED_SIGNUP:", error);
            }
          })();
        }
      } catch (err) {
        console.log("⚠️ Non-JSON message from FB:", event.data);
      }
    });

    loadSDK();
  }, [user?.id]);

  const fbLoginCallback = (response) => {
    console.log("📞 FB.login response:", response);

    if (response.authResponse?.code) {
      const authCode = response.authResponse.code;
      console.log("✅ Auth Code received:", authCode);

      (async () => {
        try {
          const res = await axios.post("/api/whatsapp/get-access-token", {
            code: authCode,
            clerkUserId: user?.id,
          });

          console.log("📦 Backend response:", res.data);

          if (res.data.success) {
            console.log("✅ WhatsApp access token stored.");
          } else {
            console.error("❌ Error saving access token:", res.data);
          }
        } catch (error) {
          console.error("🚨 Axios error:", error.response?.data || error);
        }
      })();
    } else {
      console.warn("❌ FB Login Failed. No auth code in response.", response);
    }
  };

  const launchWhatsAppSignup = () => {
    if (!window.FB) {
      console.warn("⚠️ Facebook SDK not yet loaded.");
      return;
    }

    console.log("🚀 Launching WhatsApp Embedded Signup...");

    window.FB.login(fbLoginCallback, {
      config_id: process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID,
      response_type: "code",
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: "whatsapp_embedded_signup",
        sessionInfoVersion: "3",
      },
    });
  };

  return (
    <button
      disabled={!sdkLoaded}
      onClick={launchWhatsAppSignup}
      style={{
        backgroundColor: sdkLoaded ? "#1877f2" : "#aaa",
        border: 0,
        borderRadius: 4,
        color: "#fff",
        cursor: sdkLoaded ? "pointer" : "not-allowed",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontSize: 16,
        fontWeight: "bold",
        height: 40,
        padding: "0 24px",
      }}
    >
      {sdkLoaded ? "Login with Facebook" : "Loading..."}
    </button>
  );
}
