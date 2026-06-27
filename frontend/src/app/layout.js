import { Geist, Geist_Mono , Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "react-day-picker/style.css";
import ToastProvider from "./component/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair", // Define CSS variable
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "RVR LUXURY MATRIMONY",
  description: "Premium Matrimony Service for Discerning Individuals",
  icons: {
    icon: "/icon.png",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} antialiased`}
      >
        {/* Hidden div for Google Translate */}
        <div id="google_translate_element" style={{ display: "none" }}></div>

        <ToastProvider />
        {children}

        {/* Google Translate API Scripts */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function applySavedGoogleLanguage() {
              try {
                var savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
                document.cookie = 'googtrans=/en/' + savedLanguage + '; path=/;';

                var attempt = 0;
                var maxAttempts = 20;

                function syncTranslateDropdown() {
                  var combo = document.querySelector('.goog-te-combo');

                  if (combo) {
                    if (combo.value !== savedLanguage) {
                      combo.value = savedLanguage;
                      combo.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    return;
                  }

                  attempt += 1;
                  if (attempt < maxAttempts) {
                    window.setTimeout(syncTranslateDropdown, 250);
                  }
                }

                syncTranslateDropdown();
              } catch (error) {
                console.warn('Google Translate init sync failed', error);
              }
            }

            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false,
              }, 'google_translate_element');
              applySavedGoogleLanguage();
            }
          `}
        </Script>
      </body>
    </html>
  );
}
