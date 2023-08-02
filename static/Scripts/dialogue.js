// media query event handler
if (matchMedia) {
  var mq = window.matchMedia("(min-width: 768px)");
    mq.addListener(WidthChange);
    WidthChange(mq);
}

// media query change
function WidthChange(mq) {
    if (mq.matches) {
        $('[id^="dialog-"], [id*="dialog-"]').dialog({ autoOpen: false, width: 570, buttons: [
            {
                text: "Close",
                click: function() {
                    $(this).dialog("close");
                    $('#pop-1').focus();
                }
 
                // Uncommenting the following line would hide the text,
                // resulting in the label being used as a tooltip
                //showText: false
            }
        ] });
    } else {
        $('[id^="dialog-"], [id*="dialog-"]').dialog({ autoOpen: false, maxHeight: 600, maxWidth: 300, buttons: [
             {
                 text: "Close",
                 click: function() {
                     $( this ).dialog( "close" );
                     $('#pop-1').focus();
                 }
 
                 // Uncommenting the following line would hide the text,
                 // resulting in the label being used as a tooltip
                 //showText: false
             }
        ] });
    }

}
//Close all open dialog boxes before opening the new one
function closeAll() {
    $('[id^="dialog-"], [id*="dialog-"]').dialog('close');
}
function scrollModal(dialogNum) {
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#dialog-"+dialogNum ).offset().top - 100
    }, 500);
}
$("#montlake-interchange-and-lid, #pop-1").click(function () {
    closeAll();
    $("#dialog-1").dialog("open");
    scrollModal('1');
});

$("#bicycle-pedestrian-land-bridge, #pop-2").click(function () {
    closeAll();
    $("#dialog-2").dialog("open");
    scrollModal('2');
});

$("#west-approach-bridge-south, #pop-3").click(function () {
    closeAll();
    $("#dialog-3").dialog("open");
    scrollModal('3');
});

$("#bicycle-ped-i5-crossing, #pop-4").click(function () {
    closeAll();
    $("#dialog-4").dialog("open");
    scrollModal('4');
});

$("#roanoke-lid, #pop-5").click(function () {
    closeAll();
    $("#dialog-5").dialog("open");
    scrollModal('5');
});

$("#portage-bay-bridge-replacement, #pop-7").click(function () {
    closeAll();
    $("#dialog-7").dialog("open");
    scrollModal('7');
});

$("#second-bascule-bridge, #pop-8").click(function () {
    closeAll();
    $("#dialog-8").dialog("open");
    scrollModal('8');
});
$("#improved-sr-520-i-5-transit-hov-connection, #pop-9").click(function () {
    closeAll();
    $("#dialog-9").dialog("open");
    scrollModal('9');
});
$("#pop-10").click(function () {
    closeAll();
    $("#dialog-10").dialog("open");
    scrollModal('10');
});