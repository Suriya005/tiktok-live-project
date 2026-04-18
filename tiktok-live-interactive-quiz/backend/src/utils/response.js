const ok = (res, data = null, message = null) =>
  res.status(200).json({ success: true, code: 'SUCCESS', message, data });

const okList = (res, data = [], pagination = null) =>
  res.status(200).json({ success: true, code: 'SUCCESS', message: null, data, pagination });

const created = (res, data = null) =>
  res.status(201).json({ success: true, code: 'SUCCESS', message: null, data });

const dataNotFound = (res) =>
  res.status(200).json({ success: true, code: 'DATA_NOT_FOUND', message: null, data: null });

const badRequest = (res, message, requestId = null) =>
  res.status(400).json({ success: false, code: 'INVALID_PARAM', message, data: null, requestId });

const internalError = (res, requestId = null) =>
  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    data: null,
    requestId,
  });

module.exports = { ok, okList, created, dataNotFound, badRequest, internalError };
