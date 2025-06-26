import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Alert, Paper,
  Grid, IconButton, Divider, List, ListItem, CircularProgress
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { urlService } from '../services/urlService';
import { Log } from 'logging-middleware';

// A unique ID generator for our input rows
let idCounter = 1;
const createNewInput = () => ({
  id: idCounter++,
  longUrl: '',
  customShortcode: '',
  validity: '',
});

const ShortenerPage = () => {
  const [inputs, setInputs] = useState([createNewInput()]);
  const [results, setResults] = useState([]);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Client-side URL format validation
  const isValidUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleAddInput = () => {
    if (inputs.length < 5) {
      Log('frontend', 'info', 'component', 'User added a new URL input row.');
      setInputs([...inputs, createNewInput()]);
    }
  };

  const handleRemoveInput = (id) => {
    if (inputs.length > 1) {
      Log('frontend', 'info', 'component', `User removed URL input row with id: ${id}.`);
      setInputs(inputs.filter(input => input.id !== id));
    }
  };

  const handleInputChange = (id, event) => {
    const newInputs = inputs.map(input => {
      if (input.id === id) {
        return { ...input, [event.target.name]: event.target.value };
      }
      return input;
    });
    setInputs(newInputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setResults([]);
    setIsLoading(true);
    Log('frontend', 'info', 'page', 'User submitted URL shortening form for multiple URLs.');

    const inputsToProcess = inputs.filter(input => input.longUrl.trim() !== '');

    if (inputsToProcess.length === 0) {
      const msg = 'Please enter at least one URL to shorten.';
      setFormError(msg);
      Log('frontend', 'warn', 'page', `Validation failed: ${msg}`);
      setIsLoading(false);
      return;
    }

    // Client-side validation for all inputs first
    for (let i = 0; i < inputsToProcess.length; i++) {
        const input = inputsToProcess[i];
        if (!isValidUrl(input.longUrl)) {
            const msg = `Row ${i + 1}: Please enter a valid URL (e.g., https://example.com).`;
            setFormError(msg);
            Log('frontend', 'error', 'page', `Validation failed: ${msg}`);
            setIsLoading(false);
            return;
        }
        if (input.validity && (isNaN(parseInt(input.validity)) || parseInt(input.validity) <= 0)) {
            const msg = `Row ${i + 1}: Validity must be a positive number (in minutes).`;
            setFormError(msg);
            Log('frontend', 'error', 'page', `Validation failed: ${msg}`);
            setIsLoading(false);
            return;
        }
    }

    // Process all valid inputs concurrently
    const promises = inputsToProcess.map(input =>
      urlService.shortenUrl(
        input.longUrl,
        input.customShortcode || null,
        input.validity ? parseInt(input.validity) : 30
      ).then(response => ({ status: 'fulfilled', value: response, originalUrl: input.longUrl }))
       .catch(error => ({ status: 'rejected', reason: error.message, originalUrl: input.longUrl }))
    );

    const outcomes = await Promise.all(promises);
    setResults(outcomes);
    Log('frontend', 'info', 'page', 'Finished processing all URL shortening requests.');
    setIsLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h4" gutterBottom>
        Create Short URLs
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        You can shorten up to 5 URLs at once.
      </Typography>

      {inputs.map((input, index) => (
        <Paper key={input.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label={`Original Long URL #${index + 1}`}
                name="longUrl"
                variant="outlined"
                required
                value={input.longUrl}
                onChange={(e) => handleInputChange(input.id, e)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Custom Shortcode (Optional)"
                name="customShortcode"
                variant="outlined"
                value={input.customShortcode}
                onChange={(e) => handleInputChange(input.id, e)}
              />
            </Grid>
            <Grid item xs={10} sm={4} md={2}>
              <TextField
                fullWidth
                label="Validity (Mins)"
                name="validity"
                variant="outlined"
                type="number"
                value={input.validity}
                onChange={(e) => handleInputChange(input.id, e)}
                placeholder="30"
              />
            </Grid>
            <Grid item xs={2} sm={2} md={2} container justifyContent="flex-end">
                <IconButton
                    onClick={() => handleRemoveInput(input.id)}
                    disabled={inputs.length <= 1}
                    aria-label="Remove URL"
                >
                    <RemoveCircleOutlineIcon />
                </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddInput}
          disabled={inputs.length >= 5}
        >
          Add another URL
        </Button>
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isLoading}
        sx={{ mt: 1, mb: 2, minWidth: 150 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Shorten All URLs'}
      </Button>

      {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}

      {results.length > 0 && (
          <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>Results</Typography>
              {results.map((result, index) => (
                  <Paper key={index} elevation={2} sx={{ p: 2, mb: 2, backgroundColor: result.status === 'rejected' ? '#ffebee' : '#e8f5e9' }}>
                      <Typography variant="subtitle1" sx={{ overflowWrap: 'break-word' }}>
                          <strong>Original:</strong> {result.originalUrl}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      {result.status === 'fulfilled' ? (
                          <List dense>
                              <ListItem>
                                  <Typography color="primary"><strong>Short URL:</strong> <a href={result.value.shortUrl} target="_blank" rel="noopener noreferrer">{result.value.shortUrl}</a></Typography>
                              </ListItem>
                              <ListItem>
                                  <Typography><strong>Expires:</strong> {new Date(result.value.expiryDate).toLocaleString()}</Typography>
                              </ListItem>
                          </List>
                      ) : (
                          <Alert severity="error" variant="outlined">
                              <strong>Failed:</strong> {result.reason}
                          </Alert>
                      )}
                  </Paper>
              ))}
          </Box>
      )}
    </Box>
  );
};

export default ShortenerPage;