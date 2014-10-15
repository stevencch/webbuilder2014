/// <reference path="../../linq-vsdoc.js" />


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


wbApp.controller('wbController', function ($scope, $timeout) {
    //########################################################################################################variables
    $scope.tempContent = '';
    $scope.currentNode = null;
    $scope.currntTextList = null;
    $scope.currentEditText = null;
    $scope.currntImageList = null;
    $scope.currentImageNode = null;
    $scope.currentEditImage = null;
    $scope.currentSelectedImage = null;
    $scope.imageLoadStep = 0;
    $scope.imageLoadStepTry = 3;
    $scope.imageLoadCount = 50;
    $scope.imageUrl = [];
    $scope.imageLoad = [];
    $scope.selectedSearchImage = null;
    $scope.selectedMyFolderImage = null;

    //########################################################################################################global
    $scope.defaultRootNode = {
        Type: 'div',
        Attributes: [
            {
                Key: 'id',
                Value: 'rootNode'
            },
            {
                Key: 'wb_id',
                Value: 'rootNode'
            },
            {
                Key: 'class',
                Value: 'wb_sortable row'
            }
        ],
        Children: [],
        Settings: []
    };
    $scope.rootNode = $scope.defaultRootNode;

    $scope.currentJsonNode = null;
    $scope.isFound = false;

    //########################################################################################################page function
    $scope.newPage = function () {
        $scope.rootNode = $scope.defaultRootNode;
    };


    $scope.openPage = function () {
        $.get("/api/page/load", function (data) {
            $scope.loadPage(data);
        }).fail(function () {
            alert('fail');
        });
    };

    $scope.loadPage = function (data) {
        $scope.tempContent = '';
        $scope.rootNode = data;
        $scope.getHtml(data);
        $('#htmlRoot').html($scope.tempContent);
        $(".wb_sortable").sortable({
            revert: true,
            placeholder: "ui-state-placeholder",
            stop: $scope.sortableStop
        });
        var sectionids = _.map($('*[sectionid]'), function (item) {
            return $(item).attr('sectionid');
        });
        var sectionidset = _.uniq(sectionids);
        _.each(sectionidset, function (item) {
            $scope.triggerJs(item);
        });
    }

    $scope.savePage = function () {
        $scope.reorderNode($scope.rootNode);
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

    $scope.reorderNode = function (node) {
        if (node.Children.length > 1) {
            var attribute = $scope.getAttribute(node, 'wb_id');
            var children = $('*[wb_id="' + attribute.Value + '"]').find('*[wb_id]');
            if (children.length > 0) {
                var orderChildren = [];
                for (var i = 0; i < children.length; i++) {
                    orderChildren.push(
                        {
                            wd_id: $(children[i]).attr('wb_id'),
                            order: i
                        }
                    );
                }
                var newOrder = _.sortBy(node.Children, function (item) {
                    var order = _.find(orderChildren, function (c) {
                        var result = c.wd_id == $scope.getAttribute(item, 'wb_id').Value;
                        return result;
                    }).order;
                    return order;
                });

                node.Children = newOrder;
            }
        }

    };



    //########################################################################################################init
    $scope.afterRender = function () {
        //pagebuilder
        $(".wb_sortable").sortable({
            revert: true,
            placeholder: "ui-state-placeholder",
            stop: $scope.sortableStop
        });
        $('#wb_pagebuilder').delegate('.wb_node', 'mouseenter', function (e) {
            $scope.mouseOverNode(e, this);
        });
        $('#wb_pagebuilder').delegate('.wb_node', 'click', function (e) {
            $scope.selectNode(e, this);
        });


        //toolbox
        $("#wb_toolbox").draggable({ handle: ".title" });
        $("#wb_toolbox .accordion").accordion();
        $('.wb_draggable').draggable({
            connectToSortable: ".wb_sortable",
            helper: 'clone',
            cursor: "crosshair",
            cursorAt: { left: 55, top: 30 }
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
        $("#wb_SettingsModal").draggable({
            handle: ".modal-title"
        });

        $('#myFolderTab').on('shown.bs.tab', $scope.showMyFolder);
    };

    $scope.sortableStop = function (event, ui) {
        var wb_id = ui.item.attr('wb_id');
        $scope.currentNode = ui.item;
        $scope.searchNode($scope.rootNode, 'wb_id', $scope.currentNode.parent().attr('wb_id'));
        if ($scope.currentNode.attr('sid')) {
            $.get("/api/page/" + $scope.currentNode.attr('sid'), function (data) {
                $scope.fillUUID(data);
                $scope.currentNode.attr('wb_id', $scope.getAttribute(data, 'wb_id').Value);
                $scope.currentJsonNode.Children.push(data);
                wb_id = Enumerable.From(data.Attributes).Where(function (x) { return x.Key == 'wb_id'; }).Select(function (x) { return x.Value }).ToArray()[0];
                $scope.reorderNode($scope.currentJsonNode)
                $scope.loadPage($scope.rootNode);
            }).fail(function () {
                alert('fail');
            });
        }
        else {
            $scope.reorderNode($scope.currentJsonNode)
            $scope.loadPage($scope.rootNode);
        }
    };

    $scope.mouseOverNode = function (e, item) {
        $scope.currentNode = $(item);
        $('.mouseOverNode').removeClass('mouseOverNode');
        $scope.currentNode.addClass("mouseOverNode");
        e.stopPropagation();
    };

    $scope.selectNode = function (e, item) {
        $scope.currentNode = $(item);
        $('.selectedNode').removeClass('selectedNode');
        $scope.currentNode.addClass("selectedNode");
        $scope.searchNode($scope.rootNode, 'wb_id', $scope.currentNode.attr('wb_id'));
        e.stopPropagation();
    };

    $scope.generateUUID = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    };

    $scope.fillUUID = function (node) {
        var list = ['wb_id', 'txtid', 'imgid'];
        _.each(list, function (item) {
            var attr = $scope.getAttribute(node, item);
            if (attr) {
                attr.Value = $scope.generateUUID();
            }
        });
        _.each(node.Children, function (item) {
            $scope.fillUUID(item);
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
        $scope.currentEditText = $($scope.currntTextList[index]);
        tinymce.activeEditor.setContent($scope.currentEditText.html());
    };
    $scope.saveEditText = function () {
        $scope.currentEditText.html(tinymce.activeEditor.getContent());
        $scope.searchNode($scope.rootNode, 'txtid', $scope.currentEditText.attr('txtid'));
        $scope.currentJsonNode.Children[0].Content = tinymce.activeEditor.getContent();
        $scope.updateEditTextList();
    }

    $scope.updateEditTextList = function () {
        $scope.currntTextList = $scope.currentNode.find("*[txtid]");
        $scope.editTextList = [];
        _.each($scope.currntTextList, function (item) {
            $scope.editTextList.push({
                txtid: $(item).attr('txtid'),
                text: item.innerHTML.replace(/<[^>]*>/g, ' ').short(40)
            });
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
        $scope.currentImageNode = $($scope.currntImageList[index]);
        $scope.currentEditImage = $scope.editImageList[index];
        $('.editImageItem').removeClass('active');
        $('.editImageItem-' + index).addClass('active');
        $scope.cropwidth = $scope.currentEditImage.width;
        $scope.cropheight = $scope.currentEditImage.height;
    };

    $scope.updateEditImageList = function () {
        $scope.currntImageList = $scope.currentNode.find("*[imgid]");
        $scope.editImageList = [];
        _.each($scope.currntImageList, function (item) {
            $scope.editImageList.push({
                imgid: $(item).attr('imgid'),
                image: $(item).attr('src'),
                width: item.width,
                height: item.height
            })
        });
    };

    $scope.searchImage = function () {
        $scope.currentSelectedImage = null;
        $('#btnSearch').html("Loading...");
        $('#searchPanel .content').hide();
        $.get('/api/image?query=' + $('#textSearch').val() + '&filter=size:large&top=50&skip=0',
            function (data) {
                var count = 0;
                _.each(data, function (item) {
                    $scope.imageUrl[count] = item.Url;
                    count++;
                });
                $scope.searchImageList = data;
                $scope.$apply();
                $scope.imageLoadStep = 0;
                setTimeout(loadImage, 3000);
            })
            .fail(function () {
                alert('fail');
            });
    }

    function loadImage() {
        $scope.imageLoadStep++;
        var allPass = true;
        for (var i = 0; i < $scope.imageLoadCount; i++) {
            if ($scope.imageUrl[i] != null) {
                $scope.imageLoad[i] = new Image();
                $scope.imageLoad[i].onload = showImage(i);
                $scope.imageLoad[i].alt = $scope.imageUrl[i].replace('/content/image_folder/', '').replace('/', '_');
                $scope.imageLoad[i].src = $scope.imageUrl[i];
                allPass = false;
            }
        }
        if (!allPass && $scope.imageLoadStep <= $scope.imageLoadStepTry) {
            window.console && console.log($scope.imageLoadStep);
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
        $('.wb_searchImage-' + id + ' .imagePlaceHolder').append($scope.imageLoad[id]);
        $('.wb_searchImage-' + id).show();
        $scope.imageUrl[id] = null;
    }

    $scope.selectSearchImage = function (index) {
        $('.wb_searchImage').removeClass('selected');
        $('.wb_searchImage-' + index).addClass('selected');
        $scope.selectedSearchImage = $scope.searchImageList[index];
    };


    $scope.cropImage = function () {
        $('#wb_EditImageModal').modal('hide');
        $('#wb_CropImage').attr('src', $scope.selectedSearchImage.Url);
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
                Name: $scope.selectedSearchImage.Name,
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
            $scope.selectedSearchImage = {
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
        $scope.selectedMyFolderImage = $scope.myfolderImageList[index];
    };

    //save to my folder
    $scope.saveImage = function () {
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: '/api/image/move',
            data: JSON.stringify({ String1: $scope.selectedSearchImage.Url }),
            contentType: "application/json; charset=utf-8"
        }).done(function () {
            $('#myFolderTab').tab('show');
            $scope.showMyFolder();
        }).fail(function () {
            alert('fail');
        });
    }

    $scope.updateImage = function () {
        $scope.currentImageNode.attr('src', $scope.selectedMyFolderImage.Url);
        $scope.updateEditImageList();
        $scope.searchNode($scope.rootNode, 'imgid', $scope.currentImageNode.attr('imgid'));
        _.each($scope.currentJsonNode.Attributes, function (item) {
            if (item.Key == 'src') {
                item.Value = $scope.selectedMyFolderImage.Url;
            }
        });
    };
    //########################################################################################################edit settings
    $scope.modelSettings = [];
    $scope.editSettings = function () {
        $scope.updateSettingsList();
        $('#wb_SettingsModal').modal({
            backdrop: false,
            show: true
        });
    };

    $scope.updateSettingsList = function () {
        $scope.modelSettings = [];
        $scope.findAllSettings($scope.currentJsonNode);
    }

    $scope.findAllSettings = function (node) {
        if (node.Settings && node.Settings.length > 0) {
            _.each(node.Settings, function (item) {
                $scope.modelSettings.push(item);
            });
        }
        if (node != $scope.currentJsonNode) {
            var wd_id = _.find(node.Children, function (item) {
                return item.Value == 'wb_id';
            });
            if (wd_id) {
                return;
            }
        }
        if (node.Children && node.Children.length > 0) {
            _.each(node.Children, function (item) {
                $scope.findAllSettings(item);
            });
        }
    }

    $scope.saveSettings = function () {
        var settings = $('#settingsForm input');
        for (var i = 0; i < settings.length; i++) {
            $scope.modelSettings[i].Value = $(settings[i]).val();
        }
        $('#wb_SettingsModal').modal('hide');
        $scope.tempContent = '';
        $scope.getHtml($scope.rootNode);
        $('#rootNode').html($scope.tempContent);
    }

    /*########################################################################################################helper function*/
    $scope.getHtml = function (node) {
        if (node.Type != '#text') {
            $scope.tempContent += '<' + node.Type;
            var wb_settings = node.Settings;
            var wb_settings_repeat = null;
            if (wb_settings && wb_settings.length > 0) {
                wb_settings_repeat = _.find(wb_settings, function (item) {
                    return item.Type == 'repeat';
                });
            }
            if (node.Attributes) {
                $scope.tempContent += ' ';
                for (var j = 0; j < node.Attributes.length; j++) {
                    if (node.Attributes[j].Key == 'wb_id' || node.Attributes[j].Key == 'txtid' || node.Attributes[j].Key == 'imgid') {
                        node.Attributes[j].Value = $scope.generateUUID();
                    }
                    $scope.tempContent += node.Attributes[j].Key + '="' + node.Attributes[j].Value + '" ';
                }
            }
            $scope.tempContent += '>';
            if (node.Children) {
                if (wb_settings_repeat) {
                    var i = node.Children.length;
                    var k = 0;
                    for (var j = 0; j < parseInt(wb_settings_repeat.Value) ; j++) {
                        $scope.getHtml(node.Children[k]);
                        k++;
                        if (k >= i) {
                            k = 0;
                        }
                    }
                } else {
                    for (var j = 0; j < node.Children.length; j++) {
                        $scope.getHtml(node.Children[j]);
                    }
                }
            }
            $scope.tempContent += '</' + node.Type + '>';
        }
        else {
            $scope.tempContent += node.Content;
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
    };

    $scope.getAttribute = function (node, key) {
        var value = null;
        for (var i = 0; i < node.Attributes.length; i++) {
            if (node.Attributes[i].Key == key) {
                value = node.Attributes[i];
                break;
            }
        }
        return value;
    };


});