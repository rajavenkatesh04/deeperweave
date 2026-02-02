package com.deeperweave.app;

import android.os.Bundle;
import android.graphics.Color;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Force the Status Bar to be solid BLACK (not transparent)
        getWindow().setStatusBarColor(Color.BLACK);

        // 2. Force the SideBar Bar (bottom) to be solid BLACK
        getWindow().setNavigationBarColor(Color.BLACK);

        // 3. The "Anti-Notch" Force Field
        // This tells Android: "Never let my content flow into the camera cutout area"
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_NEVER;
        }
    }
}