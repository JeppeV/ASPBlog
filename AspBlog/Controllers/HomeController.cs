using System.Web.Mvc;

namespace AspBlog.Controllers
{
    public class HomeController : Controller
    {
        /* /Home/Index */
        public ActionResult Index()
        {
            return View("Index");
        }

        /* /Home/Admin */
        public ActionResult Admin()
        {
            return View("Admin");
        }

        /* TODO: Add input validation for safety */
        /* /Home/Image/imageID */
        public ActionResult Image(string imageID)
        {
            string extension = Utility.getFileExtension(imageID);
            return File(pathToImage(imageID), "image/"+ extension);
        }

        private string pathToImage(string imageID)
        {
            return Server.MapPath("~") + @"Images\" + imageID;
        }

        




    }
}