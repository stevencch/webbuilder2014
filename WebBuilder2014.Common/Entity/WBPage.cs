using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebBuilder2014.Common.Entity
{
    public class WBPage
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public string Code { get; set; }
        [Required]
        [MaxLength]
        public string Json { get; set; }
    }
}
