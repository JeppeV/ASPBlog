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

        /* /Home/Image/imageID */
        public ActionResult Image(string imageID)
        {
            if (imageID.Contains("..")) return null;
            if (imageID.Split('\\').Length > 3) return null;
            string extension = Utility.getFileExtension(imageID);
            return File(pathToImage(imageID), "image/" + extension);
        }

        /* /Home/ContactImage */
        public ActionResult ContactImage()
        {
            return File(Server.MapPath("~") + @"Contact\contact_image.jpg", "image/jpg");
        }

        private string pathToImage(string imageID)
        {
            return Server.MapPath("~") + @"Images\" + imageID;
        }

        




    }
}