using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("home")]
    public class HomeController : Controller
    {

        public IActionResult Get()
        {
            return Ok(new { message = "Você está autenticado!" });
        }

    }
}