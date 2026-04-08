const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    code: 'SUCCESS',
    message: null,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
  });
};

module.exports = { getHealth };
