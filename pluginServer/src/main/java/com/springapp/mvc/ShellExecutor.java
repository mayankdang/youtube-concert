package com.springapp.mvc;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * Created with IntelliJ IDEA.
 * User: rishabh
 * Date: 23/11/14
 * Time: 6:15 PM
 * To change this template use File | Settings | File Templates.
 */
public class ShellExecutor {

    public static String execute(String tempFileName) throws IOException {

            Runtime rt = Runtime.getRuntime();
            Process proc = rt.exec(new String[]{"sh", tempFileName, SysProperties.getInstance().getProperty("MY_LOCAL_PATH")});
            BufferedReader stdInput = new BufferedReader(new InputStreamReader(proc.getInputStream()));
            BufferedReader stdError = new BufferedReader(new InputStreamReader(proc.getErrorStream()));

            String s = null;
            String response="";
            while ((s = stdInput.readLine()) != null) {
                response+=s;
            }

            while ((s = stdError.readLine()) != null) {
                response+=s;
            }

            return response;
    }
}
