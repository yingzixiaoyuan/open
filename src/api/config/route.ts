import { NextResponse } from 'next/server';

import { getServerSideConfig } from '../../config/server';

const serverConfig = getServerSideConfig();

// Danger! Don not write any secret value here!
// 警告！不要在这里写入任何敏感信息！
const DANGER_CONFIG = {
  needCode: serverConfig.needCode,
};

declare global {
  type DangerConfig = typeof DANGER_CONFIG;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST() {
  return NextResponse.json({
    needCode: serverConfig.needCode,
  });
}
