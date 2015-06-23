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

    public static String readFile (String filePath) {
        StringBuilder stringBuilder = new StringBuilder();
        BufferedReader in = null;
        try {
            in = new BufferedReader(
                    new InputStreamReader(
                            new FileInputStream(filePath),
                            "UTF-8"));
            // Checking if the first character is UTF-8 optional anchor.
            in.mark(1);
            if (in.read() != 0xFEFF)
                in.reset();

            String line;
            while ((line = in.readLine()) != null) {
                stringBuilder.append(line+"\n");
            }

            if(in!=null)
                in.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return stringBuilder.toString();
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
