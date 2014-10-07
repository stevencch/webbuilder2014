



/*page load*/
$(function () {
    
    //context menu
    //$.contextMenu({
    //    selector: '#wb_pagebuilder .wb_draggable',
    //    //trigger: 'hover',
    //    //delay: 200,
    //    //autoHide: true,
    //    zIndex:9999,
    //    build: function ($trigger, e) {
    //        $('.selectedNode').removeClass('selectedNode');
    //        $trigger.addClass("selectedNode");
    //        return {
    //            callback: function (key, options) {
    //                switch (key) {
    //                    case 'text':

    //                        break;
    //                }
    //                //window.console && console.log(m) || alert(m);
    //            },
    //            items: {
    //                "edit text": { name: "text", icon: "edit" },
    //                "edit image": { name: "image", icon: "edit" },
    //                "edit icon": { name: "icon", icon: "edit" },
    //                "sep1": "---------",
    //                "delete this": { name: "delete", icon: "delete" },
    //            }
    //        };
    //    }
    //});
    

    ////toolbar
    //$('#btnEditText').click(function () {
    //    var html = '<ul>';
    //    var textList = currentNode.find("*[txtid]");
    //    var active = '';
    //    for (var i = 0; i < textList.length; i++) {
    //        var txtid = $(textList[i]).attr('txtid');
    //        if (txtid == currentNode.attr('txtid')) {
    //            active = ' active';
    //        }
    //        else {
    //            active = '';
    //        }
    //        html += '<li class="list-group-item' + active + '" txtid="' + txtid + '">' + textList[i].innerHTML.replace(/<[^>]*>/g, '').short(40) + '</li>';
    //    }
    //    html += '</ul>';
    //    $('#textPanel').html(html);

    //    $('#wb_EditTextModal').modal({
    //        backdrop: false,
    //        show: true
    //    });
    //});

    
});

