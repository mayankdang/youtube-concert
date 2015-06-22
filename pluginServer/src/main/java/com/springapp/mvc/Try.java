package com.springapp.mvc;

import org.apache.commons.io.IOUtils;

import java.io.FileInputStream;

/**
 * Created with IntelliJ IDEA.
 * User: mayday
 * Date: 22/6/15
 * Time: 5:42 AM
 * To change this template use File | Settings | File Templates.
 */
public class Try {
    public static void main(String args[]) {
        String filePath = "/programmingDrive/personal/chat-python-websocket2/echo/extension/output/chrome/main.js";
        System.out.println("-----------------------------------");
        System.out.println(FileUtility.readFile(filePath));
        System.out.println("-----------------------------------");
        System.out.println(tryToReadFileToString(filePath));
        System.out.println("-----------------------------------");

    }
    // returns null if file not present.
    public static String tryToReadFileToString(String filePath) {
        FileInputStream inputStream = null;
        String everything = null;
        try {
            inputStream = new FileInputStream(filePath);
            everything = IOUtils.toString(inputStream);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        } finally {
            try {
                inputStream.close();
            } catch (Exception e) { }
        }
        return everything;
    }
}
