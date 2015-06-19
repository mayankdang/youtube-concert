package com.springapp.mvc;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

@Controller
@RequestMapping("/")
public class HelloController {

    public static String main(String filePath) {

        BufferedReader br = null;
        StringBuilder stringBuilder = new StringBuilder();

        try {

            String sCurrentLine;

            br = new BufferedReader(new FileReader(filePath));

            while ((sCurrentLine = br.readLine()) != null) {
                stringBuilder.append(sCurrentLine+"\n");
            }

        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (br != null)br.close();
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }

        return stringBuilder.toString();

    }

    @RequestMapping(method = RequestMethod.GET,value = "/content.js")
	@ResponseBody
    public ResponseEntity<String> fetchContentJS(ModelMap model) {
        String json = main(SysProperties.getInstance().getProperty("CONTENTJS_PATH"));
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Content-Type","application/x-javascript");
        return new ResponseEntity<String>(json, responseHeaders, HttpStatus.OK);
	}

    @RequestMapping(method = RequestMethod.GET,value = "/main.js")
    public ResponseEntity<String> fetchMainJS(ModelMap model) {

        String json =main(SysProperties.getInstance().getProperty("MAINJS_PATH"));

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

        String json =main(SysProperties.getInstance().getProperty("VERSION_PATH"));

        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.add("Content-Type","application/x-javascript");
        return new ResponseEntity<String>(json, responseHeaders, HttpStatus.OK);
    }

}