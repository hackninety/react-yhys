import React from 'react';

const Maintenance: React.FC = () => {
    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            color: '#343a40',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                maxWidth: '600px'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#e03131' }}>System Maintenance</h1>
                <p style={{ fontSize: '1.25rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    We are currently performing scheduled maintenance to improve our services.
                    Please check back later.
                </p>
                <div style={{ fontSize: '0.875rem', color: '#868e96' }}>
                    Error Code: 503 Service Unavailable
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
