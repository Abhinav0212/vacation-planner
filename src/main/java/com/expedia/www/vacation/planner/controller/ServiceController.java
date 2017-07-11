package com.expedia.www.vacation.planner.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@Api(tags = "demo")
@RestController
@RequestMapping("/service")
public class ServiceController {

  private static final Logger LOGGER = LoggerFactory.getLogger(ServiceController.class);

  @Value("${test.helloMsg}")
  String message;

  public void setMessage(String message) {
    this.message = message;
  }

  /**
   * Controller to say hello.
   *
   * @return ResponseEntity
   */

  @RequestMapping(value = "hello", produces = "application/json", method = RequestMethod.GET)
  @ApiOperation(value = "Say Hello")
  public ResponseEntity<HelloMessage> hello() {
    final HelloMessage helloMessage = new HelloMessage();
    helloMessage.setMessage(this.message);
    return new ResponseEntity<>(helloMessage, HttpStatus.OK);
  }

  /**
   * Controller to throw an exception.
   *
   * @return String the error result
   */
  @RequestMapping(value = "/throw/systemevent", produces = "application/json", method = RequestMethod.GET)
  @ResponseBody
  @ApiOperation(value = "Generate System Event", notes = "This will generate a system event")
  public String throwSystemEvent() {
    LOGGER.debug("To test system event");

    catchAndLogSampleSystemEventAwareException();

    return "Caught SampleSystemEventAwareException and written to the log";
  }

  private void catchAndLogSampleSystemEventAwareException() {
    try {
      throw new SampleSystemEventAwareException(SampleSystemEvent.SAMPLE_SYS_EVENT,
          "This is a test");
    } catch (SampleSystemEventAwareException e) {
      LOGGER.error("Caught SampleSystemEventAwareException", e);
    }
  }
}
