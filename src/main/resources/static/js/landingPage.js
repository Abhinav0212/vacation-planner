/**
 * Created by amahalingam on 7/19/17.
 * For the landing page of the vacation planner app.
 */

$(function () {
    let startDatePicker = $('#datetimepicker6');
    let endDatePicker = $('#datetimepicker7');

    startDatePicker.datetimepicker({
        format: 'MM/DD/YYYY',
    });
    endDatePicker.datetimepicker({
        format: 'MM/DD/YYYY',
        useCurrent: false //Important! See issue #1075
    });
    startDatePicker.on("dp.change", function (e) {
        let endDateVal = $("#end-date");
        endDatePicker.data("DateTimePicker").minDate(e.date);
        if(!endDateVal.val()){
            endDatePicker.data("DateTimePicker").date(e.date);
        }
        if($("#start-date").val()>endDateVal.val()){
            endDatePicker.data("DateTimePicker").date(e.date);
        }

    });
    endDatePicker.on("dp.change", function (e) {
        if(!$("#start-date").val()){
            startDatePicker.data("DateTimePicker").date(e.date);
        }
    });
});

$(document).on('click', '.btn', function() {
    let cityName = $("#city-input").val();
    let startDate = $("#start-date").val();
    let endDate = $("#end-date").val();
    if (cityName) {
        if(startDate && endDate){
            window.location.href = '/planner.html?location='+cityName+'&startDate='+startDate+'&endDate='+endDate;
        }
        else{
            window.location.href = '/planner.html?location='+cityName;
        }
        return false;
    }
    else {
        return false;
    }
});
