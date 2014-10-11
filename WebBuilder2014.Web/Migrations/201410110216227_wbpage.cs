namespace WebBuilder2014.Web.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class wbpage : DbMigration
    {
        public override void Up()
        {
            CreateIndex("dbo.AspNetUserClaims", "User_Id");
            CreateIndex("dbo.AspNetUserLogins", "UserId");
            CreateIndex("dbo.AspNetUserRoles", "UserId");
            CreateIndex("dbo.AspNetUserRoles", "RoleId");
        }
        
        public override void Down()
        {
            DropIndex("dbo.AspNetUserRoles", new[] { "RoleId" });
            DropIndex("dbo.AspNetUserRoles", new[] { "UserId" });
            DropIndex("dbo.AspNetUserLogins", new[] { "UserId" });
            DropIndex("dbo.AspNetUserClaims", new[] { "User_Id" });
        }
    }
}
