import { expect } from 'chai';
import * as ip from '../../../api/helpers/ip';

describe('Helpers: ip', () => {
    describe('getRemoteIp', () => {
        it('should get the IP address from a request object using the X-Forwarded-For header', () => {
            expect(ip.getRemoteIp({
                headers: {
                    'x-forwarded-for': '10.0.0.1'
                }
            })).to.equal('10.0.0.1');

            expect(ip.getRemoteIp({
                headers: {
                    'x-forwarded-for': '10.0.0.1'
                },
                connection: {
                    remoteAddress: '10.0.0.2'
                }
            })).to.equal('10.0.0.1');
        });

        it('should get the IP address from the connection.remoteAddress value as a fallback', () => {
            expect(ip.getRemoteIp({
                headers: {},
                connection: {
                    remoteAddress: '10.0.0.1'
                }
            })).to.equal('10.0.0.1');
        });
    });

    describe('getNewConnectionId', () => {
        it('should return the origin with a random UID', () => {
            expect(ip.getNewConnectionId('foo')).to.equal('foo-f91cad9');
        });
    });
});

