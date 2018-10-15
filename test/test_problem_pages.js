var expect = require('chai').expect;
var fs = require('fs');
var bot = require('../bot.js');

describe('sanitize()', function() {
    it('should remove bad patterns from the marbles page.', function() {

        // Arrange
        var filename = 'ceramic_marbles.txt'
        var page = fs.readFileSync('test/raw/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });
        var expected_marbles = fs.readFileSync('test/expected/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });

        // Act
        var sanitized_marbles = bot.sanitize(page);
        //fs.writeFileSync('test/expected/' + filename, sanitized_marbles);

        // Assert
        expect(sanitized_marbles).to.be.equal(expected_marbles);
    });
    it('should remove bad patterns from the apollo page.', function() {

        // Arrange
        var filename = 'apollo_command_service_module.txt'
        var page = fs.readFileSync('test/raw/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });
        var expected_marbles = fs.readFileSync('test/expected/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });

        // Act
        var sanitized_marbles = bot.sanitize(page);
        //fs.writeFileSync('test/expected/' + filename, sanitized_marbles);

        // Assert
        expect(sanitized_marbles).to.be.equal(expected_marbles);
    });
    it('should remove bad patterns from the chateau page.', function() {

        // Arrange
        var filename = 'chateau_de_chacenay.txt'
        var page = fs.readFileSync('test/raw/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });
        var expected_marbles = fs.readFileSync('test/expected/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });

        // Act
        var sanitized_marbles = bot.sanitize(page);
        //fs.writeFileSync('test/expected/' + filename, sanitized_marbles);

        // Assert
        expect(sanitized_marbles).to.be.equal(expected_marbles);
    });
});

describe('parseUnsourcedSentences()', function() {
    it('should find a list of "citation needed" sentences from the marbles page', function() {
        
        // Arrange
        var filename = 'ceramic_marbles.txt';
        var page = fs.readFileSync('test/raw/' + filename, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });
        page = bot.sanitize(page);
        var expected_sentences_file = 'ceramic_sentences.txt';
        var expected_sentences = fs.readFileSync('test/expected/' + expected_sentences_file, 'utf8', function(error, data) {
            if (error) throw error;
            return data;
        });

        // Act
        var parsed_sentences = bot.parseUnsourcedSentences(page);
        //fs.writeFileSync('test/expected/' + expected_sentences_file, parsed_sentences);


        // Assert
        expect(parsed_sentences.join() + '\n').to.be.equal(expected_sentences);
    });
});
