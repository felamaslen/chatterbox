import '../browser';
import { expect } from 'chai';
import * as H from '../../src/helpers';

describe('Client helper functions', () => {
    describe('getWSUrl', () => {
        it('should get the URL with the correct protocol', () => {
            expect(H.getWSUrl('http://example.com')).to.equal('ws://example.com');
            expect(H.getWSUrl('http://www.example.com/socket')).to.equal('ws://www.example.com');
        });

        it('should handle secure URLs', () => {
            expect(H.getWSUrl('https://example.com')).to.equal('wss://example.com');
            expect(H.getWSUrl('https://www.example.com/socket')).to.equal('wss://www.example.com');
        });

        it('should handle invalid URLs', () => {
            expect(H.getWSUrl('invalid-url')).to.equal('ws://localhost:3000');
        });
    });
});

