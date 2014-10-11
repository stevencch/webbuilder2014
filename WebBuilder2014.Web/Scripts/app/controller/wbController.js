/*########################################################################################################global function*/
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
/*########################################################################################################global variable*/
var uid = 0;

var tempContent = '';
var currentNode = null;
var currntTextList = null;
var currentEditText = null;
var currntImageList = null;
var currentImageNode = null;
var currentEditImage = null;
var currentSelectedImage = null;
var imageLoadStep = 0;
var imageLoadStepTry = 3;
var imageLoadCount = 50;
var imageUrl = [];
var imageLoad = [];
var selectedSearchImage = null;
var selectedMyFolderImage = null;


wbApp.controller('wbController', function ($scope) {
    //########################################################################################################global
    $scope.rootNode = {
        Type: 'div',
        Attributes: [
            {
                Key: 'id',
                Value: 'rootNode'
            }
        ,
             {
                 Key: 'wb_id',
                 Value: 'rootNode'
             }
        ],
        Children: []
    };

    $scope.currentJsonNode = null;
    $scope.isFound = false;

    //########################################################################################################page function
    $scope.newPage = function () {
        $scope.rootNode = {
            Type: 'div',
            Attributes: [
                {
                    Key: 'id',
                    Value: 'rootNode'
                },
                {
                    Key: 'wb_id',
                    Value: 'rootNode'
                }
            ],
            Children: []
        };
    };


    $scope.openPage = function () {
        $.get("/api/page/load", function (data) {
            tempContent = '';
            $scope.rootNode = data;
            $scope.getHtml(data);
            $('#rootNode').html(tempContent);
        }).fail(function () {
            alert('fail');
        });
    };
    
    $scope.savePage = function () {
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: '/api/page',
            data: JSON.stringify($scope.rootNode),
            contentType: "application/json; charset=utf-8"
        }).done(function () {
            alert('saved');
        }).fail(function () {
            alert('fail');
        });
    };

    //########################################################################################################init
    $scope.afterRender = function () {
        //pagebuilder
        $(".wb_sortable").sortable({
            revert: true,
            placeholder: "ui-state-placeholder",
            stop: $scope.sortableStop
        });
        $('#wb_pagebuilder').delegate('.wb_draggable', 'click', function () {
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

        //modal
        tinymce.init({
            selector: 'textarea#wb_textEditor',
            theme: "modern",
            width: 530,
            height: 300,
            plugins: [
                 "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
                 "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
                 "save table contextmenu directionality emoticons template paste textcolor"
            ],
            content_css: "css/content.css",
            toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | l      ink image | print preview media fullpage | forecolor backcolor emoticons",
            style_formats: [
                 { title: 'Bold text', inline: 'b' },
                 { title: 'Red text', inline: 'span', styles: { color: '#ff0000' } },
                 { title: 'Red header', block: 'h1', styles: { color: '#ff0000' } },
                 { title: 'Example 1', inline: 'span', classes: 'example1' },
                 { title: 'Example 2', inline: 'span', classes: 'example2' },
                 { title: 'Table styles' },
                 { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' }
            ]
        });
        $("#wb_EditTextModal").draggable({
            handle: ".modal-title"
        });
        $("#wb_EditImageModal").draggable({
            handle: ".modal-title"
        });

        $('#myFolderTab').on('shown.bs.tab', $scope.showMyFolder);
    };

    $scope.sortableStop = function (event, ui) {
        currentNode = ui.item;
        $scope.searchNode($scope.rootNode, 'wb_id', currentNode.parent().attr('wb_id'));
        $.get("/api/page/" + currentNode.attr('sid'), function (data) {
            tempContent = '';
            $scope.currentJsonNode.Children.push(data);
            $scope.getHtml(data);
            currentNode.html(tempContent);
            $('.selectedNode').removeClass('selectedNode');
            currentNode.addClass("selectedNode");
            $scope.triggerJs(currentNode.attr('sid'));
            //layout
            currentNode.find('.wb_sortable').sortable({
                revert: true,
                placeholder: "ui-state-placeholder",
                stop: $scope.sortableStop
            });

        }).fail(function () {
            alert('fail');
        });
    }
    //########################################################################################################edit text
    $scope.editTextList = [];
    $scope.editText = function () {
        $scope.updateEditTextList();
        $('#wb_EditTextModal').modal({
            backdrop: false,
            show: true
        });
    }
    $scope.selectEditText = function (index) {
        //(window.console && console.log($scope.editTextList[index].text)) || alert($scope.editTextList[index].text);
        currentEditText = $(currntTextList[index]);
        tinymce.activeEditor.setContent(currentEditText.html());
    };
    $scope.saveEditText = function () {
        currentEditText.html(tinymce.activeEditor.getContent());
        $scope.updateEditTextList();
    }

    $scope.updateEditTextList = function () {
        currntTextList = currentNode.find("*[txtid]");
        $scope.editTextList = [];
        _.each(currntTextList, function (item) {
            $scope.editTextList.push({
                txtid: $(item).attr('txtid'),
                text: item.innerHTML.replace(/<[^>]*>/g, ' ').short(40)
            })
        });
    };
    //########################################################################################################edit image
    $scope.cropwidth = 0;
    $scope.cropheight = 0;
    $scope.editImageList = [];
    $scope.searchImageList = [];
    $scope.myfolderImageList = [];
    $scope.editImage = function () {
        $scope.updateEditImageList();
        $('#wb_EditImageModal').modal({
            backdrop: false,
            show: true
        });
    }
    $scope.selectEditImage = function (index) {
        currentImageNode = $(currntImageList[index]);
        currentEditImage = $scope.editImageList[index];
        $('.editImageItem').removeClass('active');
        $('.editImageItem-' + index).addClass('active');
        $scope.cropwidth = currentEditImage.width;
        $scope.cropheight = currentEditImage.height;
    };

    $scope.updateEditImageList = function () {
        currntImageList = currentNode.find("*[imgid]");
        $scope.editImageList = [];
        _.each(currntImageList, function (item) {
            $scope.editImageList.push({
                imgid: $(item).attr('imgid'),
                image: $(item).attr('src'),
                width: item.width,
                height: item.height
            })
        });
    };

    $scope.searchImage = function () {
        currentSelectedImage = null;
        $('#btnSearch').html("Loading...");
        $('#searchPanel .content').hide();
        $.get('/api/image?query=' + $('#textSearch').val() + '&filter=size:large&top=50&skip=0',
            function (data) {
                var count = 0;
                _.each(data, function (item) {
                    imageUrl[count] = item.Url;
                    count++;
                });
                $scope.searchImageList = data;
                $scope.$apply();
                imageLoadStep = 0;
                setTimeout(loadImage, 3000);
            })
            .fail(function () {
                alert('fail');
            });
    }

    function loadImage() {
        imageLoadStep++;
        var allPass = true;
        for (var i = 0; i < imageLoadCount; i++) {
            if (imageUrl[i] != null) {
                imageLoad[i] = new Image();
                imageLoad[i].onload = showImage(i);
                imageLoad[i].alt = imageUrl[i].replace('/content/image_folder/', '').replace('/', '_');
                imageLoad[i].src = imageUrl[i];
                allPass = false;
            }
        }
        if (!allPass && imageLoadStep <= imageLoadStepTry) {
            window.console && console.log(imageLoadStep);
            setTimeout(loadImage, 3000);
        } else {
            $('#btnSearch').html('Search');
            $('#searchPanel .content').show();
        }
    }

    function showImage(id) {
        return function () {
            displayImage(id);
        };
    }

    function displayImage(id) {
        // window.console && console.log(id);
        $('.wb_searchImage-' + id + ' .imagePlaceHolder').append(imageLoad[id]);
        $('.wb_searchImage-' + id).show();
        imageUrl[id] = null;
    }

    $scope.selectSearchImage = function (index) {
        $('.wb_searchImage').removeClass('selected');
        $('.wb_searchImage-' + index).addClass('selected');
        selectedSearchImage = $scope.searchImageList[index];
    };


    $scope.cropImage = function () {
        $('#wb_EditImageModal').modal('hide');
        $('#wb_CropImage').attr('src', selectedSearchImage.Url);
        $('#wb_CropImageModal .modal-dialog').width((parseInt($scope.cropwidth) + 50) + 'px');
        $('#wb_CropImageModal').modal({
            backdrop: false,
            show: true
        });
        cropdata = '';
        $('#wb_CropImage').cropbox({ width: $scope.cropwidth, height: $scope.cropheight, showControls: 'auto' })
            .on('cropbox', function (event, results, img) {
                $('.cropX').text(results.cropX);
                $('.cropY').text(results.cropY);
                $('.cropW').text(results.cropW);
                $('.cropH').text(results.cropH);
                cropdata = img.getDataURL();
            });
    }

    $scope.saveCropImage = function () {
        $('#btnSaveCropImage').html('Saving...');
        if (cropdata) {
            var imageData = {
                Name: selectedSearchImage.Name,
                Data: cropdata
            }
            $.ajax({
                type: 'POST',
                dataType: "json",
                url: '/api/image/save',
                data: JSON.stringify(imageData),
                contentType: "application/json; charset=utf-8"
            }).done(function () {
                $('#wb_CropImageModal').modal('hide');
                $('#wb_EditImageModal').modal({
                    backdrop: false,
                    show: true
                });
                $('#myFolderTab').tab('show');
                $scope.showMyFolder();
                $('#btnSaveCropImage').html('Save To My Folder');
            }).fail(function () {
                alert('fail');
                $('#btnSaveCropImage').html('Save To My Folder');
            });
        }
        else {
            alert('please crop the image.')
        }
    }

    $scope.uploadImage = function () {
        $('#btnUpload').html("");
        $('#btnUpload').html("Uploading...");
        var formData = new FormData();
        var opmlFile = $('#fileUpload')[0];
        formData.append("uploadFile", opmlFile.files[0]);
        $.ajax({
            url: '/api/image',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false
        }).done(function (data) {
            $('#btnUpload').html("Upload");
            selectedSearchImage = {
                Name: data[0].Name,
                Url: data[0].Url
            };
            $('#uploadPanel').html('<div class="uploadImage"><img src="' + data[0].Url + '"/></div><div class="imageSize">' + data[0].Width + ' X ' + data[0].Height + '</div>');
        }).fail(function () {
            alert('fail');
            $('#btnUpload').html("Upload");
        });
    }

    $scope.showMyFolder = function () {
        $.get('/api/image/1',
            function (data) {
                $scope.myfolderImageList = data;
                $scope.$apply();
            })
            .fail(function () {
                alert('fail');
            });
    }

    $scope.selectMyFolderImage = function (index) {
        $('.wb_MyFolderImage').removeClass('selected');
        $('.wb_MyFolderImage-' + index).addClass('selected');
        selectedMyFolderImage = $scope.myfolderImageList[index];
    };

    //save to my folder
    $scope.saveImage = function () {
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: '/api/image/move',
            data: JSON.stringify({ String1: selectedSearchImage.Url }),
            contentType: "application/json; charset=utf-8"
        }).done(function () {
            $('#myFolderTab').tab('show');
            $scope.showMyFolder();
        }).fail(function () {
            alert('fail');
        });
    }

    $scope.updateImage = function () {
        currentImageNode.attr('src', selectedMyFolderImage.Url);
        $scope.updateEditImageList();
    }
    /*########################################################################################################helper function*/
    $scope.getHtml = function (node) {
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
                    $scope.getHtml(node.Children[j]);
                }
            }
            tempContent += '</' + node.Type + '>';
        }
        else {
            tempContent += node.Content;
        }
    }

    $scope.triggerJs = function (code) {
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

    $scope.searchNode = function (node, attr, value) {
        if ($scope.rootNode == node) {
            $scope.currentJsonNode = null;
            $scope.isFound = false;
        }
        if (node.Attributes) {
            for (var i = 0; i < node.Attributes.length; i++) {
                if (node.Attributes[i].Key == attr && node.Attributes[i].Value == value) {
                    $scope.currentJsonNode = node;
                    $scope.isFound = true;
                    break;
                }
            }
        }
        if (!$scope.isFound && node.Children) {
            for (var j = 0; j < node.Children.length; j++) {
                $scope.searchNode(node.Children[j], attr, value);
                if ($scope.isFound) {
                    break;
                }
            }
        }
    }



});