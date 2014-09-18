function showMore(element) {
    $element = $(element);
    $parent = $element.parent();
    $grandparent = $parent.parent();
    
    $grandparent.find('.panel-body').removeClass('panel-body-collapse');
    $element.hide();
    $parent.find('.readmore-link-less').show();
}

function showLess(element) {
    $element = $(element);
    $parent = $element.parent();
    $grandparent = $parent.parent();
    
    $grandparent.find('.panel-body').addClass('panel-body-collapse');
    $element.hide();
    $parent.find('.readmore-link-more').show();
}