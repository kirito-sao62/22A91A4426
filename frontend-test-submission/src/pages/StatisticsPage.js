
import React, { useState, useEffect } from 'react';
import {
  Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { urlService } from '../urlService';
import { Log } from 'logging-middleware';

const StatisticsPage = () => {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    Log('frontend', 'info', 'page', 'Statistics page loaded.');
    const allUrls = urlService.getAllUrls();
    setUrls(allUrls);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        URL Shortener Statistics
      </Typography>
      {urls.length === 0 ? (
        <Typography>No URLs have been shortened yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="statistics table">
            <TableHead>
              <TableRow>
                <TableCell>Short URL</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Expires At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urls.map((url) => (
                <TableRow key={url.shortcode}>
                  <TableCell component="th" scope="row">
                    <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
                      {url.shortUrl}
                    </a>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {url.longUrl}
                  </TableCell>
                  <TableCell>{new Date(url.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(url.expiryDate).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default StatisticsPage;
