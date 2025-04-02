import { redirect } from "next/navigation"
import { getRedirectUrl } from "@/lib/actions"

export default async function RedirectPage({ params }) {
  const { slug } = params
  const result = await getRedirectUrl(slug)

  if (!result.url) {
    redirect("/not-found")
  }

  // Enhanced version that supports both iOS and Android
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="referrer" content="no-referrer" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>Redirecting...</title>

        {/* These meta tags help with bypassing in-app browsers */}
        <meta http-equiv="refresh" content={`2;url=${result.url}`} />

        <style
          dangerouslySetInnerHTML={{
            __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
            background-color: #ffffff;
          }
          .container {
            padding: 20px;
            max-width: 90%;
            width: 500px;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 16px;
            color: #333;
          }
          p {
            font-size: 16px;
            color: #666;
            margin-bottom: 24px;
          }
          .button {
            display: inline-block;
            background-color: #0095f6;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            margin-bottom: 16px;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #0077c2;
          }
          .loader {
            border: 3px solid #f3f3f3;
            border-radius: 50%;
            border-top: 3px solid #0095f6;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .note {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
          }
        `,
          }}
        />

        {/* This script handles both iOS and Android */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            // Get the destination URL
            var destinationUrl = "${result.url}";
            
            // Function to detect platform
            function detectPlatform() {
              var userAgent = navigator.userAgent || navigator.vendor || window.opera;
              
              // iOS detection
              if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                return 'ios';
              }
              
              // Android detection
              if (/android/i.test(userAgent)) {
                return 'android';
              }
              
              return 'other';
            }
            
            var platform = detectPlatform();
            
            // Different handling based on platform
            if (platform === 'ios') {
              // iOS specific handling
              // First try: Use setTimeout to break out of the in-app browser context
              setTimeout(function() {
                window.location.href = destinationUrl;
              }, 10);
              
              // Second try: Use window.open with _system target
              setTimeout(function() {
                window.open(destinationUrl, '_system');
              }, 100);
              
              // Third try: Use a special URL scheme that might trigger external browser
              setTimeout(function() {
                var iosUrl = destinationUrl;
                // Force https if not already
                if (!iosUrl.startsWith('https://')) {
                  iosUrl = iosUrl.replace('http://', 'https://');
                }
                window.location.href = iosUrl;
              }, 200);
              
            } else if (platform === 'android') {
              // Android specific handling
              // Try intent URL first
              var intentUrl = "intent://" + 
                destinationUrl.replace(/^https?:\\/\\//, '') + 
                "#Intent;scheme=https;package=com.android.chrome;end";
              window.location.href = intentUrl;
              
              // Fallback to data URL method
              setTimeout(function() {
                var dataUrl = "data:text/html;base64," + btoa('<html><head><meta http-equiv="refresh" content="0;url=' + destinationUrl + '"></head></html>');
                window.location.href = dataUrl;
              }, 100);
              
              // Final fallback
              setTimeout(function() {
                window.location.href = destinationUrl;
              }, 200);
              
            } else {
              // For desktop or other platforms
              window.location.href = destinationUrl;
            }
            
            // Update the countdown timer
            var secondsLeft = 2;
            var countdownElement = document.getElementById('countdown');
            
            var countdownInterval = setInterval(function() {
              secondsLeft--;
              if (countdownElement) {
                countdownElement.textContent = secondsLeft;
              }
              
              if (secondsLeft <= 0) {
                clearInterval(countdownInterval);
              }
            }, 1000);
          })();
        `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <div className="loader"></div>
          <h1>Opening your link</h1>
          <p>
            Redirecting you to the website in <span id="countdown">2</span> seconds...
          </p>
          <a href={result.url} className="button" target="_blank" rel="noopener noreferrer">
            Open Now
          </a>
          <p className="note">
            If the page doesn't open automatically, please click the button above. For iOS users, you may need to tap
            and hold the link, then select "Open in Safari".
          </p>
        </div>
      </body>
    </html>
  )
}

