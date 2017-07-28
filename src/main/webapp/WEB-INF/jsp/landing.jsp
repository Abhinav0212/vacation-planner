<!DOCTYPE html>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="/WEB-INF/uitk.tld" prefix="uitk" %>
<uitk:html>

<title>Vacation Planner</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<uitk:head disableLAB="true" responsive="true">
    <uitk:title>Landing Page</uitk:title>
</uitk:head>

<uitk:body  >
    <uitk:datePicker id="defaultSingle" labelText="Single Date Picker" inputId="defaultSingleInput"/>
</uitk:body>
</uitk:html>
