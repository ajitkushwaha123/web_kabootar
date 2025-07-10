import TemplateBuilderClient from '@/components/global/template/template-builder/TemplateBuilderClient';
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemplateBuilderClient />
    </Suspense>
  );
}

export default page
