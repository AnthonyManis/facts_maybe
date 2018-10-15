var expect = require('chai').expect;
var bot = require('../bot.js');

describe('sanitize()', function() {
    it('should remove bad stuff from ceramic_marbles.txt', function() {

        // Arrange
        var fs = require('fs');
        var filename = 'ceramic_marbles.txt'
        var ceramic_marbles = fs.readFileSync('test/raw/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });
        var expected_marbles = fs.readFileSync('test/expected/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });

        // Act
        var sanitized_marbles = bot.sanitize(ceramic_marbles);
        //fs.writeFileSync('test/expected/' + filename, sanitized_marbles);

        // Assert
        expect(sanitized_marbles).to.be.equal(expected_marbles);
    });
    it('should remove bad stuff from apollo_command_service_module.txt', function() {

        // Arrange
        var fs = require('fs');
        var filename = 'apollo_command_service_module.txt'
        var ceramic_marbles = fs.readFileSync('test/raw/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });
        var expected_marbles = fs.readFileSync('test/expected/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });

        // Act
        var sanitized_marbles = bot.sanitize(ceramic_marbles);
        //fs.writeFileSync('test/expected/' + filename, sanitized_marbles);

        // Assert
        expect(sanitized_marbles).to.be.equal(expected_marbles);
    });
    it('should remove bad stuff from chateau_de_chacenay.txt', function() {

        // Arrange
        var fs = require('fs');
        var filename = 'chateau_de_chacenay.txt'
        var ceramic_marbles = fs.readFileSync('test/raw/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });
        var expected_marbles = fs.readFileSync('test/expected/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });

        // Act
        var sanitized_marbles = bot.sanitize(ceramic_marbles);
        //fs.writeFileSync('test/expected/' + filename, sanitized_marbles);

        // Assert
        expect(sanitized_marbles).to.be.equal(expected_marbles);
    });
});
