package nl.strype.streepn;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.firebaseanalytics.FirebaseAnalytics;
import com.getcapacitor.plugin.http.Http;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(Http.class);
        registerPlugin(FirebaseAnalytics.class);
    }
}