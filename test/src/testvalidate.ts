// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import expect = require('expect.js');

import {
  createKernelMessage
} from '../../lib/kernel';

import {
  validateKernelMessage, validateKernelId, validateSessionId,
  validateKernelSpec, validateContentsModel, validateCheckpointModel
} from '../../lib/validate';

import {
  DEFAULT_FILE, PYTHON_SPEC
} from './utils';


describe('jupyter.services', () => {

  describe('validateKernelMessage', () => {

    it('should pass a valid message', () => {
      let msg = createKernelMessage({
        msgType: 'comm_msg', channel: 'bar', session: 'baz'
      });
      validateKernelMessage(msg);
    });

    it('should throw if missing a field', () => {
      let msg = createKernelMessage({
        msgType: 'comm_msg', channel: 'bar', session: 'baz'
      });
      delete msg.channel;
      expect(() => validateKernelMessage(msg)).to.throwError();
    });

    it('should throw if a field is invalid', () => {
      let msg = createKernelMessage({
        msgType: 'comm_msg', channel: 'bar', session: 'baz'
      });
      (msg as any).header.username = 1;
      expect(() => validateKernelMessage(msg)).to.throwError();
    });

    it('should throw if the parent header is given an invalid', () => {
      let msg = createKernelMessage({
        msgType: 'comm_msg', channel: 'bar', session: 'baz'
      });
      msg.parent_header = msg.header;
      (msg as any).parent_header.username = 1;
      expect(() => validateKernelMessage(msg)).to.throwError();
    });

    it('should throw if the channel is not a string', () => {
      let msg = createKernelMessage({
        msgType: 'comm_msg', channel: 'bar', session: 'baz'
      });
      (msg as any).channel = 1;
      expect(() => validateKernelMessage(msg)).to.throwError();
    });

    it('should validate an iopub message', () => {
      let msg = createKernelMessage({
        msgType: 'comm_close', channel: 'iopub', session: 'baz'
      }, { comm_id: 'foo' });
      validateKernelMessage(msg);
    });

    it('should throw on an an iopub message type', () => {
      let msg = createKernelMessage({
        msgType: 'foo', channel: 'iopub', session: 'baz'
      }, { });
      expect(() => validateKernelMessage(msg)).to.throwError();
    });

    it('should throw on missing iopub message content', () => {
      let msg = createKernelMessage({
        msgType: 'error', channel: 'iopub', session: 'baz'
      }, { });
      expect(() => validateKernelMessage(msg)).to.throwError();
    });

    it('should throw on invalid iopub message content', () => {
      let msg = createKernelMessage({
        msgType: 'clear_output', channel: 'iopub', session: 'baz'
      }, { wait: 1 });
      expect(() => validateKernelMessage(msg)).to.throwError();
    });

  });

  describe('#validateKernelId()', () => {

    it('should pass a valid id', () => {
      let id = { name: 'foo', id: 'baz' };
      validateKernelId(id);
    });

    it('should fail on missing data', () => {
      expect(() => validateKernelId({ name: 'foo' })).to.throwError();
      expect(() => validateKernelId({ id: 'foo' })).to.throwError();
    });

    it('should fail on incorrect data', () => {
      let id = { name: 'foo', id: 1 };
      expect(() => validateKernelId(id as any)).to.throwError();
    });

  });

  describe('#validateSessionId()', () => {

    it('should pass a valid id', () => {
      let id = {
        id: 'foo',
        kernel: { name: 'foo', id: '123'},
        notebook: { path: 'bar' }
      }
      validateSessionId(id);
    });

    it('should fail on missing data', () => {
      let id = {
        id: 'foo',
        kernel: { name: 'foo', id: '123'},
        notebook: { }
      }
      expect(() => validateSessionId(id as any)).to.throwError();
    });

    it('should fail on incorrect data', () => {
      let id = {
        id: 'foo',
        kernel: { name: 'foo', id: 123 },
        notebook: { path: 'bar' }
      }
      expect(() => validateSessionId(id as any)).to.throwError();
    });

  });

  describe('#validateKernelSpec', () => {

    it('should pass with valid data', () => {
      validateKernelSpec(PYTHON_SPEC);
    });

    it('should fail on missing data', () => {
      let spec = JSON.parse(JSON.stringify(PYTHON_SPEC));
      delete spec['name'];
      expect(() => validateKernelSpec(spec)).to.throwError();
    });

    it('should fail on incorrect data', () => {
      let spec = JSON.parse(JSON.stringify(PYTHON_SPEC));
      spec.spec.language = 1;
      expect(() => validateKernelSpec(spec)).to.throwError();
    });

  });

  describe('validateContentsModel()', () => {

    it('should pass with valid data', () => {
      validateContentsModel(DEFAULT_FILE);
    });

    it('should fail on missing data', () => {
      let model = JSON.parse(JSON.stringify(DEFAULT_FILE));
      delete model['path'];
      expect(() => validateContentsModel(model)).to.throwError();
    });

    it('should fail on incorrect data', () => {
      let model = JSON.parse(JSON.stringify(DEFAULT_FILE));
      model.format = 1;
      expect(() => validateContentsModel(model)).to.throwError();
    });

  });

  describe('validateCheckpointModel()', () => {

    it('should pass with valid data', () => {
      validateCheckpointModel({ id: 'foo', last_modified: 'yesterday '});
    });

    it('should fail on missing data', () => {
      let model = { id: 'foo' };
      expect(() => validateCheckpointModel(model as any)).to.throwError();
    });

    it('should fail on incorrect data', () => {
      let model = { id: 1, last_modified: '1'}
      expect(() => validateCheckpointModel(model as any)).to.throwError();
    });

  });

});
