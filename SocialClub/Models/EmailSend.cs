﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SocialClub.Models
{
    public class EmailSend
    {
        public int EmailSendID { get; set; }
        public string ToEmailAddress { get; set; }
        public string FromEmailAddress { get; set; }
        public string Subject { get; set; }
        public Nullable<System.DateTime> SendDate { get; set; }
        [AllowHtml]
        public string HtmlContent { get; set; }
        public Nullable<bool> Status { get; set; }
    }
}