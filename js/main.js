

// global variables
// ================
var surveyData = [];
var surveyQuestions = [];
var answers = ["agree_strongly", "agree", "neither", "disagree", "disagree_strongly", "unsure", "na"];
var summedResponses = [];
var totalCount = 0;

// helper functions
// ================

// comma seperator for thousands
var formatCommas = d3.format(",");

//round to one decimal
var noDecimal = d3.format(".0f");

// function chain
// ==============

// get CSV files
function getData(){
  d3.csv("data/HLA-SurveyData.csv", function(data){ 
    surveyData = data;
    getQuestions();
  });
}

function getQuestions(){
  d3.csv("data/SurveyQuestions.csv", function(data){ 
    surveyQuestions = data;
    buildHtml();
  });
}

function buildHtml() {
	totalCount = surveyData.length;
	$("#surveyCount").html(totalCount);
	$.each(surveyQuestions, function(index, question){
		var sectionId = '#' + question.id;
		var questionHtml = '<div id="' + question.name + '" class="question-block">' +
			'<h5>' + question.label +  
			((question.hint !== "none") ? '<br><small>' + question.hint + '</small>' : '') +
			'<br><span class="text-tagalog">' + question["label-tagalog"] + '</span>' + 
			((question["hint-tagalog"] !== "none") ? '<br><small><span class="text-tagalog">' +
			question["hint-tagalog"] + '</span>' + '</small>' : '') +

			'</h5><div class="responsesBar">' +
	          '<svg width="100%" height="30">' +
	            '<rect class="response-bar na" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar unsure" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar disagree_strongly" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar disagree" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar neither" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar agree" y="0" height="100%" ></rect>' +
	            '<rect class="response-bar agree_strongly" y="0" height="100%" ></rect>' +
	          '</svg>' +
			'</div>';
		$(sectionId).append(questionHtml);
		var questionId = '#' + question.name;
	});
	parseData();
}


function parseData() {

	summedResponses = [];
	// count up responses by question (A01, A02, ...) and answer (strongly_agree, agree, ...)
	$.each(surveyQuestions, function(questionIndex, question){
		var questionObject = {};
		var answerCountsObject = {};
		$.each(answers, function(answerIndex, answer){
			answerCountsObject[answer] = 0;
		});
		questionObject[question.name] = answerCountsObject;
	

		$.each(surveyData, function(responseIndex, response){
			var thisAnswer = response[question.name];
			questionObject[question.name][thisAnswer] += 1;
		});
		summedResponses.push(questionObject);
		// summedResponses = { {A01: {agree:52, agree_strongly:5, disagree:16, ...}},{A02: {agree:56; ...}}, ... }
	});
	graphData();
}

function graphData() {
	
	$.each(summedResponses, function(questionIndex, questionObject){
		var questionDivId = '';
		var thisQuestionData = {};

		$.each(questionObject, function(questionIndex, questionData){ 
			questionDivId = '#' + questionIndex; // "#A01", "#A02", ...
			thisQuestionData = questionData;
		});
	
		// calculate the percentage for each and add to the div as an html data attr for the tooltip
		$.each(thisQuestionData, function(answerIndex, answerData){
			thisQuestionData[answerIndex] = ( answerData / totalCount ) * 100;
			var selector = questionDivId + " ." + answerIndex;
			var styledPercentage = noDecimal(thisQuestionData[answerIndex]) + "%";
			$(selector).attr("data-percentage", styledPercentage);
		});

		// the viz is overlapping svg rectangle in the same category order
		// calculate each width as its own percentage plus those to the left
		var agree_strongly = thisQuestionData["agree_strongly"];
		thisQuestionData["agree_strongly"] = agree_strongly.toString() + "%";
		
		var agree = agree_strongly + thisQuestionData["agree"];
		thisQuestionData["agree"] = agree.toString() + "%";
		
		var neither = agree + thisQuestionData["neither"];
		thisQuestionData["neither"] = neither.toString() + "%";
		
		var disagree = neither + thisQuestionData["disagree"];
		thisQuestionData["disagree"] = disagree.toString() + "%";
		
		var disagree_strongly = disagree + thisQuestionData["disagree_strongly"];
		thisQuestionData["disagree_strongly"] = disagree_strongly.toString() + "%";
		
		var unsure = disagree_strongly + thisQuestionData["unsure"];
		thisQuestionData["unsure"] = unsure.toString() + "%";
		
		var na = unsure + thisQuestionData["na"];
		thisQuestionData["na"] = na.toString() + "%";
		
		// use the calculated widths to adjust the rectangles
		$.each(thisQuestionData, function(indexa, responseCategorya){
			var selector = questionDivId + " ." + indexa;
			$(selector).attr("width", responseCategorya);
		});
		

	});

	d3.selectAll(".response-bar").on("mouseover", function(d){
		var tooltipText = $(this).attr("data-percentage");
		$('#tooltip').append(tooltipText);       
	}).on("mouseout", function(){ 
        $('#tooltip').empty();
    });
	$(".response-bar").mouseover(function(e) {        
        //Set the X and Y axis of the tooltip
        $('#tooltip').css('top', e.pageY  );
        $('#tooltip').css('left', e.pageX + 20 );         
    }).mousemove(function(e) {    
        //Keep changing the X and Y axis for the tooltip, thus, the tooltip move along with the mouse
        $("#tooltip").css({top:(e.pageY)+"px",left:(e.pageX+20)+"px"});        
    });

    $(".loader").fadeOut(400);
}




// function generateGraphs(){
//   var admin4List = [];
//   $.each(displayedShelters, function(index, shelter){
//     if($.inArray(shelter.properties.admin4, admin4List) === -1){
//       admin4List.push(shelter.properties.admin4);
//     }
//   });
//   var maleYoung = 0;
//   var maleChild = 0;
//   var maleAdult = 0;
//   var maleSenior = 0;
//   var femaleYoung = 0;
//   var femaleChild = 0;
//   var femaleAdult = 0;
//   var femaleSenior = 0;
//   var pregnant = 0;
//   var mSingleHead = 0;
//   var fSingleHead = 0;
//   var mDisabled = 0;
//   var fDisabled = 0;
//   $.each(demographicData, function(index, household){
//     if($.inArray(household.admin4, admin4List) !== -1){
//       maleYoung += parseInt(household.male_young, 10);
//       maleChild += parseInt(household.male_child, 10);
//       maleAdult += parseInt(household.male_adult, 10);
//       maleSenior += parseInt(household.male_senior, 10);
//       femaleYoung += parseInt(household.female_young, 10);
//       femaleChild += parseInt(household.female_child, 10);
//       femaleAdult += parseInt(household.female_adult, 10);
//       femaleSenior += parseInt(household.female_senior, 10); 
//       pregnant += parseInt(household["vulnerabilities/pregnant_lactating"], 10);     
//       mDisabled += parseInt(household["vulnerabilities/disabled_ill_male"], 10);
//       fDisabled += parseInt(household["vulnerabilities/disabled_ill_female"], 10);
//       if(household["vulnerabilities/single_headed"] === "yes"){
//         switch(household["vulnerabilities/single_headed_sex"]){
//           case 'male':
//             mSingleHead += 1;
//             break;
//           case 'female':
//             fSingleHead += 1;
//             break;
//         }
//       }
//     }
//   });
//   var femaleTotal = femaleYoung + femaleChild + femaleAdult + femaleSenior;
//   var maleTotal = maleYoung + maleChild + maleAdult + maleSenior;
//   var grandTotal = femaleTotal + maleTotal;
//   $("#maleYoung").html(formatCommas(maleYoung));
//   $("#maleChild").html(formatCommas(maleChild));
//   $("#maleAdult").html(formatCommas(maleAdult));
//   $("#maleSenior").html(formatCommas(maleSenior));
//   $("#femaleYoung").html(formatCommas(femaleYoung));
//   $("#femaleChild").html(formatCommas(femaleChild));
//   $("#femaleAdult").html(formatCommas(femaleAdult));
//   $("#femaleSenior").html(formatCommas(femaleSenior));
//   $("#pregnant").html(formatCommas(pregnant));
//   $("#mSingleHead").html(formatCommas(mSingleHead));
//   $("#fSingleHead").html(formatCommas(fSingleHead));
//   $("#mDisabled").html(formatCommas(mDisabled));
//   $("#fDisabled").html(formatCommas(fDisabled));
//   $("#mSingleHead").html(formatCommas(mSingleHead));
//   $("#fSingleHead").html(formatCommas(fSingleHead));
//   $("#maleTotal").html(formatCommas(maleTotal));
//   $("#femaleTotal").html(formatCommas(femaleTotal));
//   $("#grandTotal").html(formatCommas(grandTotal));
// }

//start function chain for map
getData();