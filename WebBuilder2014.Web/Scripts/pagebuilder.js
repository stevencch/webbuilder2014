/*global function*/
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\xA0]+|[\s\xA0]+$/g, '');
    };
}

String.prototype.short = function (i) {
    if (this.length < i) {
        i = this.length;
    }
    return this.substr(0, i);
};
/*global variable*/
var uid = 0;
var currentSection = null;
var tempContent = '';
var currentNode = null;



/*page load*/
$(function () {
    //pagebuilder
    $(".wb_sortable").sortable({
        revert: true,
        placeholder: "ui-state-placeholder",
        stop: sortableStop
    });
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
    $('#wb_pagebuilder').delegate('.wb_draggable','click', function () {
        currentNode = $(this);
        $('.selectedNode').removeClass('selectedNode');
        currentNode.addClass("selectedNode");
    });

    //toolbox
    $("#wb_toolbox").draggable({ handle: ".title" });
    $("#wb_toolbox .accordion").accordion();
    $('.wb_draggable').draggable({
        connectToSortable: ".wb_sortable",
        helper: "clone"
    });

    //toolbar
    $('#btnEditText').click(function () {
        var html = '<ul>';
        var textList = currentNode.find("*[txtid]");
        var active = '';
        for (var i = 0; i < textList.length; i++) {
            var txtid = $(textList[i]).attr('txtid');
            if (txtid == currentNode.attr('txtid')) {
                active = ' active';
            }
            else {
                active = '';
            }
            html += '<li class="list-group-item' + active + '" txtid="' + txtid + '">' + textList[i].innerHTML.replace(/<[^>]*>/g, '').short(40) + '</li>';
        }
        html += '</ul>';
        $('#textPanel').html(html);

        $('#wb_EditTextModal').modal({
            backdrop: false,
            show: true
        });
    });

    //modal
    $("#wb_EditTextModal").draggable({
        handle: ".modal-title"
    });
});

/*helper function*/
function getHtml(node) {
    if (node.Type != '#text') {
        tempContent += '<' + node.Type;
        if (node.Attributes) {
            tempContent += ' ';
            for (var j = 0; j < node.Attributes.length; j++) {
                tempContent += node.Attributes[j].Key + '="' + node.Attributes[j].Value + '" ';
            }
        }
        tempContent += '>';
        if (node.Children) {
            for (var j = 0; j < node.Children.length; j++) {
                getHtml(node.Children[j]);
            }
        }
        tempContent += '</' + node.Type + '>';
    }
    else {
        tempContent += node.Content;
    }
}

function triggerJs(code) {
    switch (code) {
        case 's0101':
            $('[data-hover="dropdown"]').dropdownHover();
            break;
        case 's0102':
            $('#da-slider').cslider();
            break;
        case 's0108':
            $('#clients-flexslider').flexslider({
                animation: "slide",
                easing: "swing",
                animationLoop: true,
                itemWidth: 1,
                itemMargin: 1,
                minItems: 2,
                maxItems: 9,
                controlNav: false,
                directionNav: false,
                move: 2
            });
            break;
    }
}

function sortableStop(event, ui) {
    currentSection = ui.item;
    $.get("/api/page/" + currentSection.attr('sid'), function (data) {
        tempContent = '';
        getHtml(data);
        currentSection.html(tempContent);
        triggerJs(currentSection.attr('sid'));
        //layout
        currentSection.find('.wb_sortable').sortable({
            revert: true,
            placeholder: "ui-state-placeholder",
            stop: sortableStop
        });

    }).fail(function () {
        alert('fail');
    });
}