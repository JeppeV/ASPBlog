using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AspBlog.Controllers
{
    public class AngularViewsController : Controller
    {
        // GET: AngularViews
        public ActionResult Home()
        {
            return View("Home");
        }

        public ActionResult Contact()
        {
            return View("Contact");
        }
    }
}