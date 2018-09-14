// test-setup.spec.js
const sinon = require('sinon');
const chai = require('chai');

afterEach(function () {
  sinon.restore();
});
