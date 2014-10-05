/*global*/
var uid = 0;
var currentSection = null;
var tempContent = '';



/*page load*/
$(function () {
    //pagebuilder
    $(".wb_sortable").sortable({
        revert: true,
        stop: sortableStop
    });
    //toolbox
    $("#wb_toolbox").draggable({ handle: ".title" });
    $("#wb_toolbox .accordion").accordion();
    $('.wb_draggable').draggable({
        connectToSortable: ".wb_sortable",
        helper: "clone"
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
    $.get("/api/page/" + currentSection.attr('sid'), function(data) {
        tempContent = '';
        getHtml(data);
        currentSection.html(tempContent);
        triggerJs(currentSection.attr('sid'));
        //layout
        currentSection.find('.wb_sortable').sortable({
            revert: true,
            stop: sortableStop
        });

    }).fail(function() {
        alert('fail');
    });
}