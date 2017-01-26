using System.IO;
using System.Web.Mvc;
using System.Web.Helpers;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using System.Web.Services;
using AspBlog.Models;
using System;

namespace AspBlog.Controllers
{
    public class HomeController : Controller
    {
        /* /Home/Index */
        public ActionResult Index()
        {
            return View("Index");
        }
        
        /* /Home/Test */
        public ActionResult Test()
        {
            return View("Test");
        }

        

    }
}