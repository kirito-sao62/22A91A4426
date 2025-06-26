
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, CircularProgress } from '@mui/material';
import { urlService } from '../urlService';
import { Log } from 'logging-middleware';

const RedirectPage = () => {
  const { shortcode } = useParams();
  const [message, setMessage] = useState('Redirecting...');
  
  useEffect(() => {
    Log('frontend', 'info', 'component', `Attempting to redirect for shortcode: ${shortcode}`);
    const urlData = urlService.getUrlByShortcode(shortcode);

    if (urlData) {
      // Check for expiry
      const isExpired = new Date(urlData.expiryDate) < new Date();
      if (isExpired) {
        const msg = `Link with shortcode '${shortcode}' has expired.`;
        setMessage(msg);
        Log('frontend', 'warn', 'component', msg);
      } else {
        Log('frontend', 'info', 'component', `Redirecting to ${urlData.longUrl}`);
        window.location.href = urlData.longUrl;
      }
    } else {
      const msg = `No URL found for the shortcode: '${shortcode}'.`;
      setMessage(msg);
      Log('frontend', 'error', 'component', msg);
    }
  }, [shortcode]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        {message === 'Redirecting...' && <CircularProgress />}
        <Typography variant="h6" sx={{ mt: 2 }}>
            {message}
        </Typography>
    </Box>
  );
};

export default RedirectPage;
