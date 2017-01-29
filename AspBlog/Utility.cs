using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AspBlog
{
    
    public abstract class Utility
    {
        public static string getFileExtension(string s)
        {
            string[] tokens = s.Split('.');
            return tokens[tokens.Length - 1];
        }

    }
}