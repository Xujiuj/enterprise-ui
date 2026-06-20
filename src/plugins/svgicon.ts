import {
  ArrowLeft,
  Check,
  CircleCheck,
  CircleClose,
  Close,
  Connection,
  Delete,
  DocumentAdd,
  DocumentCopy,
  Download,
  Edit,
  EditPen,
  Finished,
  Grid,
  List,
  Menu,
  Minus,
  Operation,
  Plus,
  Promotion,
  Refresh,
  RefreshLeft,
  RefreshRight,
  Search,
  Setting,
  Sort,
  Unlock,
  Upload,
  User,
  View,
  WarnTriangleFilled
} from '@element-plus/icons-vue';
import type { App, Component } from 'vue';

const icons: Record<string, Component> = {
  ArrowLeft,
  'arrow-left': ArrowLeft,
  Check,
  CircleCheck,
  CircleClose,
  Close,
  Connection,
  Delete,
  DocumentAdd,
  DocumentCopy,
  Download,
  Edit,
  EditPen,
  Finished,
  Grid,
  List,
  Menu,
  Minus,
  Operation,
  Plus,
  Promotion,
  Refresh,
  RefreshLeft,
  RefreshRight,
  Search,
  search: Search,
  Setting,
  Sort,
  Unlock,
  Upload,
  User,
  View,
  WarnTriangleFilled
};

export default {
  install: (app: App) => {
    for (const [key, component] of Object.entries(icons)) {
      app.component(key, component);
    }
  }
};
