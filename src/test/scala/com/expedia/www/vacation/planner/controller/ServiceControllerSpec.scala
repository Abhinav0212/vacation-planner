package com.expedia.www.vacation.planner.controller

import org.scalatest.mock.EasyMockSugar
import org.scalatest.{FunSpec, GivenWhenThen, Matchers}

class ServiceControllerSpec extends FunSpec with GivenWhenThen with Matchers with EasyMockSugar {

  describe("A valid instance of ServiceController") {
    it ("should return string 'Hello there!'") {
      Given("a valid ServiceController")
      val serviceController = new ServiceController
      val msg = "Hello there!"
      serviceController.setMessage(msg)
      When("hello is invoked")
      val actual = serviceController.hello
      Then("the result should match the pre-set value")
      def body: HelloMessage = actual.getBody.asInstanceOf[HelloMessage]
      body.getMessage should equal(msg)
    }
  }
}
