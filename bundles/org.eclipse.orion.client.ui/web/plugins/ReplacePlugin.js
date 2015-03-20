/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
/*global URL*/
/*globals ActiveXObject alert createXMLHttpRequest p_here orion*/

define(["orion/xhr","orion/Deferred"],function(xhr,Deferred){ 
		var headers = {
			name: "Replace Plugin",
			version: "1.0", //$NON-NLS-0$
			description: "Replace with local history support for the editor."
		};
		var provider = new orion.PluginProvider(headers);
		var serviceImpl = {
              /**
               * @callback
               */
              run: function(text) {
                  doJSON();
              }
        }
        var serviceProperties = {
              name: "ReplaceFile Text",
              key: ["e", true, true] // Ctrl+Shift+e
        };
	    provider.registerService("orion.edit.command", serviceImpl, serviceProperties);
        provider.connect();
	
	
	var xmlHttp;
	function createXMLHttpRequest() {
		try {xmlHttp = new XMLHttpRequest();}
		catch(e) {
			var IEXHRVers =["Msxml3.XMLHTTP","Msxml2.XMLHTTP","Microsoft.XMLHTTP"];
			for (var i=0,len=IEXHRVers.length;i< len;i++) {
				xmlHttp = new ActiveXObject(IEXHRVers[i]);
				if(xmlHttp !== undefined) {continue;}
				else{break;}	
			}
		}
	}
	
	var url="org.eclipse.orion.internal.server.servlets.file.FileHandlerV1.handleRequest";
	
	function doJSON() {      
		var text= {"parts":"fileHistory","file":"fileURL"}; 
		text["fileURL"] = new URL(window.location.href);//tested
  		//var url="org.eclipse.orion.internal.server.servlets.file.FileHandlerV1.handleRequest";  
    createXMLHttpRequest();   
		xmlHttp("GET", url, { 
			headers : { 
				"Orion-Version" : "1",
				"Content-Type" : "text/html"
			},
			timeout : 15000,
			handleAs : "json" //$NON-NLS-0$
		}).then(function(result) {
				p_here.innerHTML =  p_here.innerHTML + "<br/>" + result;
				var response =  result.response ? JSON.parse(result.response) : null;
				p_here.innerHTML = p_here.innerHTML + "<br/>" 
						+ response["config/userInfo"].GitMail;
		});

    	xmlHttp.onreadystatechange = handleStateChange;       
    	xmlHttp.send(text);  
	} 
	
	function handleStateChange() {  
    	if(xmlHttp.readyState == 4) {  
        	if(xmlHttp.status == 200) {  
            	parseResults();  
        	}  
    	}  
  	} 
    
	
	function parseResults() {
  		//display and analyze the result
		var fileHistory = {"parts": [ "xxxx","sssss" ] };//an example for test
		var returnResult = eval(fileHistory);
	}
});

	
 