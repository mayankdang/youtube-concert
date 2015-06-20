package com.springapp.mvc;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: rishabh
 * Date: 9/9/14
 * Time: 7:51 AM
 * To change this template use File | Settings | File Templates.
 */
public class FileUtility {

    public static String readFile(String fname){
        StringBuffer stringBuffer=new StringBuffer();
        BufferedReader br = null;
        try{
            br = new BufferedReader(new FileReader(fname));
            String line;
            while ((line = br.readLine()) != null) {
                stringBuffer.append(line+"\n");
            }
            if(br!=null)
                br.close();
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return stringBuffer.toString();
    }

    public static List<String> readListFromFile(String fname){
        BufferedReader br;
        List<String> result = new ArrayList<String>();
        try{
            br = new BufferedReader(new FileReader(fname));
            String line;
            while ((line = br.readLine()) != null) {
                result.add(line);
            }
            if(br!=null)
                br.close();
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return result;
    }

    public static void writeFile(String fname,String content ){
        try {
            File file = new File(fname);

            if (!file.exists()) {
                file.createNewFile();
            }

            FileWriter fw = new FileWriter(file.getAbsoluteFile());
            BufferedWriter bw = new BufferedWriter(fw);
            bw.write(content);
            bw.close();
        } catch (IOException e) {
        }
    }

    public static void deleteFile(String fname){
        try{
            File file = new File(fname);
            file.delete();
        }catch(Exception e){
        }
    }

    public static void appendToFile(String fname,String content){
        try {
            PrintWriter out = new PrintWriter(new BufferedWriter(new FileWriter(fname, true)));
            out.println(content);
            out.close();
        } catch (IOException e) {
        }
    }
}
