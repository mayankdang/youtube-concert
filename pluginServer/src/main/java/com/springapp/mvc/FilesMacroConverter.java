package com.springapp.mvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: rishabh
 * Date: 29/6/15
 * Time: 11:31 PM
 */
public class FilesMacroConverter {

    static HashMap<String,String> macros=new HashMap<String, String>();
    static HashMap<String,String> macrod=new HashMap<String, String>();

    static {
        macros.put("ACK","a");
        macros.put("CLIENT_TIMESTAMP","b");
        macros.put("CLIENT_VERSION","c");
        macros.put("CLOCK_DIFF","d");
        macros.put("CONCERT_CREATED","e");
        macros.put("CONCERT_JOINED","f");
        macros.put("CONCERT_TAG","g");
        macros.put("CONCERT_TAKEN","h");
        macros.put("DIE","i");
        macros.put("I_AM_ALREADY_OWNER","j");
        macros.put("LATEST_JOINEE_CONCERT","k");
        macros.put("LATEST_OWNER_CONCERT","l");
        macros.put("LEAVE_CONCERT","m");
        macros.put("LOAD_VIDEO","n");
        macros.put("NETWORK_DELAY","o");
        macros.put("NO_CONCERT","p");
        macros.put("OWNER_DELAY","q");
        macros.put("OWNER_FLAG","r");
        macros.put("PAGE_LOADED","s");
        macros.put("PATCH_CONTENT","t");
        macros.put("PATCH_MAIN","u");
        macros.put("REQUEST_TYPE","v");
        macros.put("RESPONSE_TYPE","w");
        macros.put("SERVER_TIMESTAMP","x");
        macros.put("SYNC_VIDEO","y");
        macros.put("TAB_ID","z");
        macros.put("TAB_UPDATE_LATEST","aa");
        macros.put("USER_ID","ab");
        macros.put("VIDEO_STATE","ac");
        macros.put("VIDEO_TIME","ad");
        macros.put("VIDEO_URL","ae");
        macros.put("VOFFSET","af");

        macrod.put("R_ADMIN_PATCH","ag");
        macrod.put("R_ADMIN_VERSION_UPDATE","ah");
        macrod.put("R_CLOCK_DIFF","ai");
        macrod.put("R_CREATE_USER","aj");
        macrod.put("R_HANDSHAKING","ak");
        macrod.put("R_LEAVE_CONCERT","al");
        macrod.put("R_NETWORK_DELAY","am");
        macrod.put("R_PAGE_LOADED","an");
        macrod.put("R_USER_ONLINE","ao");
        macrod.put("R_VIDEO_UPDATE","ap");
        macrod.put("AWESOME_DELAY","aq");
    }

    public static void main(String[] args) {
        String files[]={SysProperties.getInstance().getProperty("CONTENTJS_PATH").replace(".js",".build.js"),SysProperties.getInstance().getProperty("MAINJS_PATH").replace(".js",".build.js"),SysProperties.getInstance().getProperty("SERVER_PYTHON_PATH").replace(".py",".build.py")};

        for(String name : files){

            List<String> x=FileUtility.readListFromFile(name);

            String result="";
            for(String i : x){

                for(Map.Entry<String, String> entry : macros.entrySet()) {
                    if(i.indexOf("\""+entry.getKey()+"\"")>-1){
                        i=i.replace("\""+entry.getKey()+"\"","\""+macros.get(entry.getKey())+"\"");

                        if(!name.endsWith(".js")&&i.indexOf(entry.getKey())>-1){
                            i=i.replace(entry.getKey(),macros.get(entry.getKey()));
                        }
                    }
                }

                if(name.endsWith(".js")){
                    for(Map.Entry<String, String> entry : macrod.entrySet()) {
                        if(i.indexOf(entry.getKey())>-1){
                            i=i.replace(entry.getKey(),macrod.get(entry.getKey()));
                        }
                    }
                }

                result=result+i+"\n";
            }

            if(name.endsWith(".js")){
                FileUtility.writeFile(name.replace(".js",".live.js"),result);
            }
            else if(name.endsWith(".py")) {
                FileUtility.writeFile(name.replace(".py",".live.py"),result);
            }
        }
    }
}
