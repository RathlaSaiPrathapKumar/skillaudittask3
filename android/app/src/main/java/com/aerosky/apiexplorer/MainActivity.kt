package com.aerosky.apiexplorer

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        
        // Configure hardware acceleration and settings
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.databaseEnabled = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true

        // Router client to handle internal links vs external links
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url.toString()
                
                // Allow API paths and local assets inside WebView
                if (url.startsWith("file://") || 
                    url.contains("open-meteo.com") || 
                    url.contains("spaceflightnews") || 
                    url.contains("tvmaze") || 
                    url.contains("dummyjson")
                ) {
                    return false
                }
                
                // Route user profiles, news sites to native browser
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                return true
            }
        }

        // Load entry file from packaged assets
        webView.loadUrl("file:///android_asset/index.html")
    }

    // Capture hardware back button to enable in-app WebView backward navigation
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
