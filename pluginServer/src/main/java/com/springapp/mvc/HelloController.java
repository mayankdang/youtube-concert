package com.springapp.mvc;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;

@Controller
@RequestMapping("/")
public class HelloController {

    @RequestMapping(method = RequestMethod.GET,value = "/content.js")
	@ResponseBody
    public ResponseEntity<String> fetchContentJS(ModelMap model) {
        String json = FileUtility.readFile(SysProperties.getInstance().getProperty("CONTENTJS_PATH"));

        json=json.replace("SERVER_HOST_DOMAIN",SysProperties.getInstance().getProperty("SERVER_HOST_DOMAIN"));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Content-Type","application/x-javascript");
        return new ResponseEntity<String>(json, responseHeaders, HttpStatus.OK);
	}

    @RequestMapping(method = RequestMethod.GET,value = "/main.js")
    public ResponseEntity<String> fetchMainJS(ModelMap model) {

        String json = FileUtility.readFile(SysProperties.getInstance().getProperty("MAINJS_PATH"));
        json=json.replace("SERVER_HOST_DOMAIN",SysProperties.getInstance().getProperty("SERVER_HOST_DOMAIN"));

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Content-Type","application/x-javascript");
        return new ResponseEntity<String>(json, responseHeaders, HttpStatus.OK);
    }


    @RequestMapping(method = RequestMethod.GET,value = "/test.js")
    public ResponseEntity<String> fooBar2() {
        String json = "jsonResponse";
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Content-Type","application/x-javascript");
        return new ResponseEntity<String>(json, responseHeaders, HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET,value = "/version.txt")
    public ResponseEntity<String> fetchversionJS(ModelMap model) {

        String json =FileUtility.readFile(SysProperties.getInstance().getProperty("VERSION_PATH"));

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Content-Type","application/x-javascript");
        return new ResponseEntity<String>(json, responseHeaders, HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET,value = "/access/request")
    public ResponseEntity<String> handleRequest(ModelMap model,@RequestParam(value="action")String action,@RequestParam(value="token")String token) {
        if(token!=null&&action!=null&&token.equals(SysProperties.getInstance().getProperty("SECURITY_TOKEN"))){
            if(action.equals("rs")){
                try {
                    System.out.println(ShellExecutor.execute(SysProperties.getInstance().getProperty("RESTART_SERVER_SCRIPT")));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            else if(action.equals("rc")) {
                try {
                    System.out.println(ShellExecutor.execute(SysProperties.getInstance().getProperty("RESTART_CLIENT_SCRIPT")));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Content-Type","text/plain");
        return new ResponseEntity<String>("ok", responseHeaders, HttpStatus.OK);
    }

}